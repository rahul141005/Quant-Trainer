/**
 * progress.js — localStorage-based progress tracking
 *
 * Stores:
 *   totalAttempted, totalCorrect, bestStreak, currentStreak,
 *   drillSessions, timedTestSessions, dailyStreak,
 *   lastPracticeDate, todayAttempted, todayCorrect,
 *   categoryStats (per-category attempted/correct)
 */

var PROGRESS_KEY = 'quant_reflex_progress';

/** Return saved progress or defaults */
function loadProgress() {
  try {
    var raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) {
      var data = JSON.parse(raw);
      /* Check if date has changed — reset today counters */
      var today = new Date().toDateString();
      if (data.lastActiveDate !== today) {
        /* Check daily streak continuity */
        if (data.lastActiveDate) {
          var last = new Date(data.lastActiveDate);
          var now = new Date(today);
          var diffDays = Math.round((now - last) / (1000 * 60 * 60 * 24));
          if (diffDays > 1) {
            data.dailyStreak = 0; /* streak broken */
          }
        }
        data.todayAttempted = 0;
        data.todayCorrect = 0;
        data.lastActiveDate = today;
        saveProgress(data);
      }
      /* Ensure category stats object exists */
      if (!data.categoryStats) data.categoryStats = {};
      return data;
    }
  } catch (_) {
    /* ignore parse errors */
  }
  return {
    totalAttempted: 0, totalCorrect: 0,
    bestStreak: 0, currentStreak: 0,
    drillSessions: 0, timedTestSessions: 0,
    dailyStreak: 0, lastActiveDate: null,
    lastPracticeDate: null,
    todayAttempted: 0, todayCorrect: 0,
    categoryStats: {}
  };
}

/** Persist progress to localStorage */
function saveProgress(data) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
}

/**
 * Record the result of a single answer.
 * @param {boolean} correct
 * @param {string}  [category] - optional question category for tracking
 */
function recordAnswer(correct, category) {
  var p = loadProgress();
  var today = new Date().toDateString();

  /* Daily streak: increment on first practice of a new day */
  if (p.lastPracticeDate !== today) {
    p.dailyStreak = (p.dailyStreak || 0) + 1;
    p.lastPracticeDate = today;
  }

  p.lastActiveDate = today;
  p.totalAttempted++;
  p.todayAttempted = (p.todayAttempted || 0) + 1;

  if (correct) {
    p.totalCorrect++;
    p.todayCorrect = (p.todayCorrect || 0) + 1;
    p.currentStreak++;
    if (p.currentStreak > p.bestStreak) p.bestStreak = p.currentStreak;
  } else {
    p.currentStreak = 0;
  }

  /* Category tracking */
  if (category) {
    if (!p.categoryStats) p.categoryStats = {};
    if (!p.categoryStats[category]) {
      p.categoryStats[category] = { attempted: 0, correct: 0 };
    }
    p.categoryStats[category].attempted++;
    if (correct) p.categoryStats[category].correct++;
  }

  saveProgress(p);
}

/** Record completion of a drill session */
function recordDrillSession() {
  var p = loadProgress();
  p.drillSessions = (p.drillSessions || 0) + 1;
  saveProgress(p);
}

/** Record completion of a timed test session */
function recordTimedTestSession() {
  var p = loadProgress();
  p.timedTestSessions = (p.timedTestSessions || 0) + 1;
  saveProgress(p);
}

/** Reset all progress */
function resetProgress() {
  saveProgress({
    totalAttempted: 0, totalCorrect: 0,
    bestStreak: 0, currentStreak: 0,
    drillSessions: 0, timedTestSessions: 0,
    dailyStreak: 0, lastActiveDate: null,
    lastPracticeDate: null,
    todayAttempted: 0, todayCorrect: 0,
    categoryStats: {}
  });
}
