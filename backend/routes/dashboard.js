import express from 'express';
import { db } from '../database/init.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  if (userRole === 'patient') {
    // Patient dashboard stats
    const queries = {
      totalMedications: 'SELECT COUNT(*) as count FROM medications WHERE user_id = ?',
      adherenceRate: `
        WITH recent_logs AS (
          SELECT 
            m.id,
            m.frequency,
            COUNT(ml.id) as taken_count,
            CASE 
              WHEN m.frequency = 'once_daily' THEN 30
              WHEN m.frequency = 'twice_daily' THEN 60
              WHEN m.frequency = 'three_times_daily' THEN 90
              WHEN m.frequency = 'four_times_daily' THEN 120
              WHEN m.frequency = 'every_8_hours' THEN 90
              WHEN m.frequency = 'every_12_hours' THEN 60
              ELSE 30
            END as expected_count
          FROM medications m
          LEFT JOIN medication_logs ml ON m.id = ml.medication_id 
            AND ml.taken_date >= date('now', '-30 days')
          WHERE m.user_id = ?
          GROUP BY m.id
        )
        SELECT 
          CASE 
            WHEN SUM(expected_count) > 0 
            THEN (SUM(taken_count) * 100.0) / SUM(expected_count)
            ELSE 0 
          END as adherence_rate
        FROM recent_logs
      `,
      todaysDue: `
        SELECT COUNT(*) as count 
        FROM medications m
        WHERE m.user_id = ?
          AND NOT EXISTS (
            SELECT 1 FROM medication_logs ml 
            WHERE ml.medication_id = m.id 
              AND ml.taken_date = date('now')
          )
      `
    };

    let stats = {};
    let completed = 0;
    const totalQueries = Object.keys(queries).length;

    Object.entries(queries).forEach(([key, query]) => {
      db.get(query, [userId], (err, result) => {
        if (err) {
          console.error(`Error in ${key} query:`, err);
          stats[key] = 0;
        } else {
          stats[key] = key === 'adherenceRate' ? (result.adherence_rate || 0) : (result.count || 0);
        }

        completed++;
        if (completed === totalQueries) {
          res.json({
            message: 'Dashboard statistics retrieved successfully',
            data: {
              totalMedications: stats.totalMedications,
              adherenceRate: Math.round(stats.adherenceRate * 100) / 100,
              todaysDue: stats.todaysDue
            }
          });
        }
      });
    });

  } else {
    // Caretaker dashboard stats
    res.json({
      message: 'Caretaker dashboard statistics',
      data: {
        totalPatients: 0,
        averageAdherence: 0,
        missedDoses: 0,
        activeMedications: 0
      }
    });
  }
});

// Get recent activity
router.get('/activity', (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  if (userRole === 'patient') {
    const query = `
      SELECT 
        m.name as medication_name,
        ml.taken_date,
        ml.taken_at,
        'medication_taken' as activity_type
      FROM medication_logs ml
      JOIN medications m ON ml.medication_id = m.id
      WHERE ml.user_id = ?
      ORDER BY ml.taken_at DESC
      LIMIT 10
    `;

    db.all(query, [userId], (err, activities) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to fetch recent activity' });
      }

      const formattedActivities = activities.map(activity => ({
        description: `Took ${activity.medication_name}`,
        timestamp: new Date(activity.taken_at).toLocaleString(),
        type: activity.activity_type
      }));

      res.json({
        message: 'Recent activity retrieved successfully',
        data: formattedActivities
      });
    });

  } else {
    // Caretaker activity - placeholder
    res.json({
      message: 'Caretaker activity retrieved successfully',
      data: []
    });
  }
});

export default router;