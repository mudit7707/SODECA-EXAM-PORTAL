// Timer utility for exam duration tracking
class ExamTimer {
  constructor(durationInMinutes) {
    this.durationInMinutes = durationInMinutes;
    this.durationInMs = durationInMinutes * 60 * 1000;
    this.startTime = null;
    this.endTime = null;
    this.remainingTime = this.durationInMs;
    this.isPaused = false;
    this.pausedAt = null;
  }

  start() {
    this.startTime = new Date();
    this.endTime = new Date(this.startTime.getTime() + this.durationInMs);
    return {
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.durationInMinutes
    };
  }

  getRemainingTime() {
    if (!this.startTime) {
      return this.durationInMs;
    }

    if (this.isPaused) {
      return this.remainingTime;
    }

    const now = new Date();
    const elapsed = now - this.startTime;
    this.remainingTime = Math.max(0, this.durationInMs - elapsed);
    
    return {
      remainingMs: this.remainingTime,
      remainingMinutes: Math.floor(this.remainingTime / 60000),
      remainingSeconds: Math.floor((this.remainingTime % 60000) / 1000),
      isExpired: this.remainingTime <= 0
    };
  }

  pause() {
    if (!this.isPaused && this.startTime) {
      this.isPaused = true;
      this.pausedAt = new Date();
      const elapsed = this.pausedAt - this.startTime;
      this.remainingTime = Math.max(0, this.durationInMs - elapsed);
      return true;
    }
    return false;
  }

  resume() {
    if (this.isPaused) {
      const pausedDuration = new Date() - this.pausedAt;
      this.startTime = new Date(this.startTime.getTime() + pausedDuration);
      this.endTime = new Date(this.endTime.getTime() + pausedDuration);
      this.isPaused = false;
      this.pausedAt = null;
      return true;
    }
    return false;
  }

  getStatus() {
    return {
      isActive: !!this.startTime,
      isPaused: this.isPaused,
      startTime: this.startTime,
      endTime: this.endTime,
      ...this.getRemainingTime()
    };
  }

  static formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }
}

// Active timers storage (in production, use Redis or similar)
const activeTimers = new Map();

function createTimer(userId, examId, durationInMinutes) {
  const key = `${userId}-${examId}`;
  const timer = new ExamTimer(durationInMinutes);
  activeTimers.set(key, timer);
  return timer.start();
}

function getTimer(userId, examId) {
  const key = `${userId}-${examId}`;
  return activeTimers.get(key);
}

function removeTimer(userId, examId) {
  const key = `${userId}-${examId}`;
  return activeTimers.delete(key);
}

module.exports = {
  ExamTimer,
  createTimer,
  getTimer,
  removeTimer
};
