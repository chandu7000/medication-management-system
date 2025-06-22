import express from 'express';
import { db } from '../database/init.js';
import { medicationValidation, validateRequest } from '../middleware/validation.js';

const router = express.Router();

// Get all medications for the authenticated user
router.get('/', (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT 
      m.*,
      GROUP_CONCAT(ml.taken_date) as taken_dates
    FROM medications m
    LEFT JOIN medication_logs ml ON m.id = ml.medication_id
    WHERE m.user_id = ?
    GROUP BY m.id
    ORDER BY m.created_at DESC
  `;

  db.all(query, [userId], (err, medications) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Failed to fetch medications' });
    }

    // Process taken_dates to be an array
    const processedMedications = medications.map(med => ({
      ...med,
      taken_dates: med.taken_dates ? med.taken_dates.split(',') : []
    }));

    res.json({
      message: 'Medications retrieved successfully',
      data: processedMedications
    });
  });
});

// Create new medication
router.post('/', medicationValidation, validateRequest, (req, res) => {
  const { name, dosage, frequency, instructions } = req.body;
  const userId = req.user.id;

  db.run(
    'INSERT INTO medications (user_id, name, dosage, frequency, instructions) VALUES (?, ?, ?, ?, ?)',
    [userId, name, dosage, frequency, instructions || null],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to create medication' });
      }

      // Fetch the created medication
      db.get(
        'SELECT * FROM medications WHERE id = ?',
        [this.lastID],
        (err, medication) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Medication created but failed to retrieve' });
          }

          res.status(201).json({
            message: 'Medication created successfully',
            data: { ...medication, taken_dates: [] }
          });
        }
      );
    }
  );
});

// Update medication
router.put('/:id', medicationValidation, validateRequest, (req, res) => {
  const { id } = req.params;
  const { name, dosage, frequency, instructions } = req.body;
  const userId = req.user.id;

  // First check if medication belongs to user
  db.get(
    'SELECT id FROM medications WHERE id = ? AND user_id = ?',
    [id, userId],
    (err, medication) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (!medication) {
        return res.status(404).json({ message: 'Medication not found' });
      }

      // Update medication
      db.run(
        'UPDATE medications SET name = ?, dosage = ?, frequency = ?, instructions = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, dosage, frequency, instructions || null, id],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Failed to update medication' });
          }

          // Fetch updated medication
          db.get(
            `SELECT 
              m.*,
              GROUP_CONCAT(ml.taken_date) as taken_dates
            FROM medications m
            LEFT JOIN medication_logs ml ON m.id = ml.medication_id
            WHERE m.id = ?
            GROUP BY m.id`,
            [id],
            (err, updatedMedication) => {
              if (err) {
                return res.status(500).json({ message: 'Failed to retrieve updated medication' });
              }

              res.json({
                message: 'Medication updated successfully',
                data: {
                  ...updatedMedication,
                  taken_dates: updatedMedication.taken_dates ? updatedMedication.taken_dates.split(',') : []
                }
              });
            }
          );
        }
      );
    }
  );
});

// Delete medication
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // First check if medication belongs to user
  db.get(
    'SELECT id FROM medications WHERE id = ? AND user_id = ?',
    [id, userId],
    (err, medication) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (!medication) {
        return res.status(404).json({ message: 'Medication not found' });
      }

      // Delete medication (logs will be deleted due to CASCADE)
      db.run(
        'DELETE FROM medications WHERE id = ?',
        [id],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Failed to delete medication' });
          }

          res.json({ message: 'Medication deleted successfully' });
        }
      );
    }
  );
});

// Mark medication as taken
router.post('/:id/taken', (req, res) => {
  const { id } = req.params;
  const { date } = req.body;
  const userId = req.user.id;

  if (!date) {
    return res.status(400).json({ message: 'Date is required' });
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
  }

  // First check if medication belongs to user
  db.get(
    'SELECT id FROM medications WHERE id = ? AND user_id = ?',
    [id, userId],
    (err, medication) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (!medication) {
        return res.status(404).json({ message: 'Medication not found' });
      }

      // Insert or update medication log
      db.run(
        'INSERT OR REPLACE INTO medication_logs (medication_id, user_id, taken_date) VALUES (?, ?, ?)',
        [id, userId, date],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Failed to mark medication as taken' });
          }

          res.json({
            message: 'Medication marked as taken successfully',
            data: {
              medication_id: id,
              taken_date: date,
              taken_at: new Date().toISOString()
            }
          });
        }
      );
    }
  );
});

// Get adherence statistics
router.get('/adherence', (req, res) => {
  const userId = req.user.id;
  const { days = 30 } = req.query;

  // Calculate adherence rate for the last N days
  const query = `
    WITH date_range AS (
      SELECT date('now', '-' || ? || ' days') as start_date,
             date('now') as end_date
    ),
    expected_doses AS (
      SELECT 
        m.id,
        m.name,
        m.frequency,
        dr.start_date,
        dr.end_date,
        CASE 
          WHEN m.frequency = 'once_daily' THEN ?
          WHEN m.frequency = 'twice_daily' THEN ? * 2
          WHEN m.frequency = 'three_times_daily' THEN ? * 3
          WHEN m.frequency = 'four_times_daily' THEN ? * 4
          WHEN m.frequency = 'every_8_hours' THEN ? * 3
          WHEN m.frequency = 'every_12_hours' THEN ? * 2
          ELSE ? -- as_needed
        END as expected_count
      FROM medications m
      CROSS JOIN date_range dr
      WHERE m.user_id = ?
    ),
    actual_doses AS (
      SELECT 
        ml.medication_id,
        COUNT(*) as actual_count
      FROM medication_logs ml
      WHERE ml.user_id = ?
        AND ml.taken_date >= date('now', '-' || ? || ' days')
        AND ml.taken_date <= date('now')
      GROUP BY ml.medication_id
    )
    SELECT 
      ed.id,
      ed.name,
      ed.expected_count,
      COALESCE(ad.actual_count, 0) as actual_count,
      CASE 
        WHEN ed.expected_count > 0 
        THEN ROUND((COALESCE(ad.actual_count, 0) * 100.0) / ed.expected_count, 2)
        ELSE 0 
      END as adherence_rate
    FROM expected_doses ed
    LEFT JOIN actual_doses ad ON ed.id = ad.medication_id
  `;

  db.all(
    query, 
    [days, days, days, days, days, days, days, days, userId, userId, days],
    (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to calculate adherence' });
      }

      // Calculate overall adherence rate
      const totalExpected = results.reduce((sum, med) => sum + med.expected_count, 0);
      const totalActual = results.reduce((sum, med) => sum + med.actual_count, 0);
      const overallAdherence = totalExpected > 0 ? (totalActual / totalExpected) * 100 : 0;

      res.json({
        message: 'Adherence statistics retrieved successfully',
        data: {
          period_days: parseInt(days),
          overall_adherence_rate: Math.round(overallAdherence * 100) / 100,
          medications: results
        }
      });
    }
  );
});

export default router;