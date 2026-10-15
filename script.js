// Initialize Supabase for your whole project
const supabaseUrl = 'https://svpbnvobbkujjganvyek.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2cGJudm9iYmt1ampnYW52eWVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5MTkxMTAsImV4cCI6MjEwNzQ5NTExMH0.KBUcvJeY-oCEiWWnk1id-A8QzsXW_UVJgtfF-NEDhHo';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

const sidebar = document.getElementById('sidebar');
const toast = document.getElementById('toast');
const currentPage = document.body.dataset.page;

const studentNameKey = 'bloombreedStudentName';
const studentIdKey = 'bloombreedStudentId';
const studentMessagesKey = 'bloombreedStudentMessages';
const teacherScoresKey = 'bloombreedTeacherScores';

if (document.body.dataset.role === 'student') {
  const applyStudentId = (studentId) => {
    localStorage.setItem(studentIdKey, studentId);
    const studentIdDisplay = document.getElementById('studentIdDisplay');
    if (studentIdDisplay) studentIdDisplay.textContent = studentId;
    if (currentPage === 'results') {
      renderStudentScores(studentId);
      studentLoadScore(studentId);
    }
  };

  const applyStudentName = (studentName) => {
    localStorage.setItem(studentNameKey, studentName);
    document.querySelectorAll('.top-profile strong, .profile-mini strong, .settings-profile strong').forEach((element) => {
      element.textContent = studentName;
    });
    const initials = studentName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
    document.querySelectorAll('.top-profile .avatar, .profile-mini .avatar, .settings-profile .avatar').forEach((avatar) => {
      avatar.textContent = initials;
    });
    const greetingName = document.getElementById('studentNameGreeting');
    if (greetingName) greetingName.textContent = studentName;
  };

  const savedName = localStorage.getItem(studentNameKey);
  const savedStudentId = localStorage.getItem(studentIdKey);
  if (savedName && savedStudentId) {
    applyStudentName(savedName);
    applyStudentId(savedStudentId);
  } else {
    const overlay = document.createElement('div');
    overlay.className = 'student-name-overlay';
    overlay.innerHTML = '<form class="student-name-dialog" role="dialog" aria-modal="true" aria-labelledby="studentNameTitle"><span class="name-dialog-icon" aria-hidden="true">✦</span><p class="panel-eyebrow">WELCOME TO BLOOMBREED</p><h2 id="studentNameTitle">Set up your student profile</h2><p>Your name appears in the portal. Your Student ID identifies your results.</p><label for="studentNameInput">Your name</label><input id="studentNameInput" name="studentName" type="text" autocomplete="name" required maxlength="60" placeholder="Enter your name"><label for="studentIdInput">Student ID</label><input id="studentIdInput" name="studentId" type="text" required maxlength="60" placeholder="Enter your Student ID"><button class="primary-button" type="submit">Continue <span>→</span></button></form>';
    document.body.append(overlay);
    overlay.querySelector('#studentNameInput').value = savedName || '';
    overlay.querySelector('#studentIdInput').value = savedStudentId || '';
    overlay.querySelector('form').addEventListener('submit', (event) => {
      event.preventDefault();
      const nameInput = overlay.querySelector('#studentNameInput');
      const idInput = overlay.querySelector('#studentIdInput');
      const studentName = nameInput.value.trim();
      const studentId = idInput.value.trim();
      if (!studentName || !studentId) {
        (!studentName ? nameInput : idInput).focus();
        return;
      }
      applyStudentName(studentName);
      applyStudentId(studentId);
      overlay.remove();
    });
    overlay.querySelector('#studentNameInput').focus();
  }
}

document.getElementById('switchStudentBtn')?.addEventListener('click', () => {
  localStorage.removeItem(studentIdKey);
  alert('You have logged out. Please enter your Student ID.');
  location.reload();
});

document.querySelectorAll('.nav-item[data-page]').forEach((item) => {
  const isCurrentPage = item.dataset.page === currentPage;
  item.classList.toggle('active', isCurrentPage);
  if (isCurrentPage) {
    item.setAttribute('aria-current', 'page');
  } else {
    item.removeAttribute('aria-current');
  }
});

document.getElementById('menuButton')?.addEventListener('click', () => {
  sidebar?.classList.toggle('open');
});

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2600);
}

document.getElementById('scheduleButton')?.addEventListener('click', () => showToast('Added to your schedule'));
document.getElementById('viewTasks')?.addEventListener('click', () => {
  window.location.href = 'assignments.html';
});
document.getElementById('fullTimetableButton')?.addEventListener('click', () => {
  window.location.href = 'timetable.html';
});
document.getElementById('assignmentButton')?.addEventListener('click', () => {
  window.location.href = 'assignments.html';
});
document.getElementById('downloadTimetable')?.addEventListener('click', () => showToast('Timetable download is ready'));

document.querySelectorAll('[data-toast]').forEach((button) => {
  button.addEventListener('click', () => showToast(button.dataset.toast));
});

const teacherMessageForm = document.getElementById('teacherMessageForm');
const recipientInput = teacherMessageForm?.elements.namedItem('recipient');
if (recipientInput && localStorage.getItem(studentNameKey)) {
  recipientInput.value = localStorage.getItem(studentNameKey);
}
teacherMessageForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(teacherMessageForm);
  const message = {
    sender: String(formData.get('sender')).trim(),
    recipient: String(formData.get('recipient')).trim(),
    subject: String(formData.get('subject')).trim(),
    body: String(formData.get('body')).trim(),
    time: new Date().toLocaleString(),
  };

  if (!message.sender || !message.recipient || !message.subject || !message.body) {
    showToast('Please complete every message field.');
    return;
  }

  const storedMessages = JSON.parse(localStorage.getItem(studentMessagesKey) || '[]');
  if (!Array.isArray(storedMessages)) {
    showToast('Saved messages could not be read.');
    return;
  }
  storedMessages.push(message);
  localStorage.setItem(studentMessagesKey, JSON.stringify(storedMessages));
  teacherMessageForm.reset();
  teacherMessageForm.elements.sender.value = 'Teacher';
  updateTeacherCounts();
  showToast(`Message sent to ${message.recipient}.`);
});

function readTeacherScores() {
  const savedScores = localStorage.getItem(teacherScoresKey);
  if (!savedScores) return [];
  const scores = JSON.parse(savedScores);
  if (!Array.isArray(scores)) {
    showToast('Saved scores could not be read.');
    return null;
  }
  let migrated = false;
  scores.forEach((score) => {
    if (!score.localId) {
      score.localId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
      migrated = true;
    }
  });
  if (migrated) localStorage.setItem(teacherScoresKey, JSON.stringify(scores));
  return scores;
}

function renderStudentScores(studentId, cloudScores = null, cloudLoadFailed = false) {
  const resultsList = document.getElementById('studentResultsList');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreStatus = document.getElementById('scoreStatus');
  const scoreRingValue = document.getElementById('scoreRingValue');
  const resultRing = document.querySelector('.result-ring');
  if (!resultsList || !scoreDisplay || !scoreStatus || !scoreRingValue) return;

  const scores = readTeacherScores();
  if (!scores) {
    scoreStatus.textContent = 'Saved scores could not be read.';
    return;
  }
  const matchingLocalScores = scores.filter((score) => score.studentId === studentId);
  const displayedScores = cloudScores === null
    ? matchingLocalScores.map((score) => ({ ...score, source: 'This device' }))
    : cloudScores.map((score) => ({
      subject: score.subject,
      assessment: score.assessment,
      score: Number(score.score),
      createdAt: score.created_at,
      source: 'Supabase',
    }));
  resultsList.replaceChildren();

  displayedScores.forEach((score) => {
    const row = document.createElement('div');
    row.className = 'result-row';
    const subject = document.createElement('strong');
    subject.textContent = score.subject || 'Score';
    const assessment = document.createElement('span');
    assessment.textContent = score.assessment || 'Assessment';
    const source = document.createElement('span');
    source.textContent = score.source;
    const mark = document.createElement('b');
    mark.textContent = `${score.score}/100`;
    const grade = document.createElement('span');
    grade.textContent = '';
    row.append(subject, assessment, source, mark, grade);
    resultsList.append(row);
  });

  if (displayedScores.length === 0) {
    const emptyState = document.createElement('p');
    emptyState.className = 'results-empty-state';
    emptyState.textContent = 'No scores found for this Student ID.';
    resultsList.append(emptyState);
    scoreDisplay.textContent = '—';
    scoreRingValue.textContent = '—';
    scoreStatus.textContent = cloudLoadFailed
      ? 'Could not load cloud scores; no scores are saved on this device.'
      : 'No scores have been added yet.';
    if (resultRing) resultRing.style.background = 'conic-gradient(var(--yellow) 0%, #ffffff22 0)';
    return;
  }

  const averageScore = displayedScores.reduce((total, score) => total + score.score, 0) / displayedScores.length;
  scoreDisplay.textContent = averageScore.toFixed(1);
  scoreRingValue.textContent = `${Math.round(averageScore)}%`;
  scoreStatus.textContent = cloudScores === null
    ? `Showing scores saved on this device for ${studentId}${cloudLoadFailed ? ' (cloud unavailable).' : '.'}`
    : `${displayedScores.length} score${displayedScores.length === 1 ? '' : 's'} loaded from Supabase for ${studentId}.`;
  if (resultRing) resultRing.style.background = `conic-gradient(var(--yellow) ${averageScore}%, #ffffff22 0)`;
}

function updateTeacherCounts() {
  const scores = readTeacherScores();
  const messages = JSON.parse(localStorage.getItem(studentMessagesKey) || '[]');
  const scoreCount = document.getElementById('scoreCount');
  const messageCount = document.getElementById('messageCount');
  if (scoreCount && scores) scoreCount.textContent = String(scores.length);
  if (messageCount) messageCount.textContent = String(Array.isArray(messages) ? messages.length : 0);
}

const teacherScoreForm = document.getElementById('teacherScoreForm');
const teacherScoreList = document.getElementById('teacherScoreList');
const pendingTeacherScoreIds = new Set();
function renderTeacherScores() {
  if (!teacherScoreList) return;
  const scores = readTeacherScores();
  if (!scores) return;
  teacherScoreList.replaceChildren();
  if (!scores.length) {
    const emptyState = document.createElement('p');
    emptyState.className = 'teacher-empty-state';
    emptyState.textContent = 'No scores entered yet.';
    teacherScoreList.append(emptyState);
    return;
  }

  scores.slice().reverse().forEach((score) => {
    const row = document.createElement('div');
    row.className = 'teacher-score-row';
    row.dataset.localId = score.localId;
    const student = document.createElement('strong');
    student.textContent = score.studentId || score.student || 'Unknown student';
    const details = document.createElement('span');
    details.textContent = `${score.subject} · ${score.assessment}`;
    const mark = document.createElement('b');
    mark.textContent = `${score.score}/100`;
    const deleteButton = document.createElement('button');
    deleteButton.className = 'teacher-score-delete';
    deleteButton.type = 'button';
    deleteButton.dataset.deleteScore = score.localId;
    deleteButton.disabled = pendingTeacherScoreIds.has(score.localId);
    deleteButton.textContent = deleteButton.disabled ? 'Saving…' : 'Delete';
    deleteButton.setAttribute('aria-label', `Delete ${score.subject} ${score.assessment} score for ${score.studentId || score.student}`);
    row.append(student, details, mark, deleteButton);
    teacherScoreList.append(row);
  });
}

teacherScoreForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(teacherScoreForm);
  const score = {
    localId: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
    studentId: String(formData.get('studentId')).trim(),
    subject: String(formData.get('subject')),
    assessment: String(formData.get('assessment')).trim(),
    score: Number(formData.get('score')),
  };
  if (!score.studentId || !score.subject || !score.assessment || !Number.isInteger(score.score) || score.score < 0 || score.score > 100) {
    showToast('Enter a student ID, subject, assessment, and score from 0 to 100.');
    return;
  }

  const scores = readTeacherScores();
  if (!scores) return;
  scores.push(score);
  localStorage.setItem(teacherScoresKey, JSON.stringify(scores));
  pendingTeacherScoreIds.add(score.localId);
  renderTeacherScores();
  const cloudResult = await teacherUpdateScore(score.studentId, score.subject, score.assessment, score.score);
  pendingTeacherScoreIds.delete(score.localId);
  if (cloudResult.success) {
    score.cloudId = cloudResult.id;
    const latestScores = readTeacherScores();
    if (latestScores) {
      const savedScore = latestScores.find((item) => item.localId === score.localId);
      if (savedScore) {
        savedScore.cloudId = cloudResult.id;
        localStorage.setItem(teacherScoresKey, JSON.stringify(latestScores));
      }
    }
  }
  teacherScoreForm.reset();
  renderTeacherScores();
  updateTeacherCounts();
  showToast(cloudResult.success
    ? `Score saved and synced for ${score.studentId}.`
    : `Score saved on this device, but cloud sync failed for ${score.studentId}.`);
});

teacherScoreList?.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-delete-score]');
  if (!button) return;
  const localId = button.dataset.deleteScore;
  const scores = readTeacherScores();
  if (!scores) return;
  const score = scores.find((item) => item.localId === localId);
  if (!score) {
    showToast('That score could not be found.');
    renderTeacherScores();
    return;
  }
  if (!confirm(`Delete the ${score.subject} score for ${score.studentId || score.student}?`)) return;

  button.disabled = true;
  if (score.cloudId) {
    const deleted = await teacherDeleteScore(score.cloudId);
    if (!deleted) {
      button.disabled = false;
      showToast('Cloud deletion failed; the score was kept.');
      return;
    }
  }

  const remainingScores = scores.filter((item) => item.localId !== localId);
  localStorage.setItem(teacherScoresKey, JSON.stringify(remainingScores));
  renderTeacherScores();
  updateTeacherCounts();
  showToast(score.cloudId ? 'Score deleted from the cloud.' : 'This-device score deleted.');
});

const teacherPage = document.body.dataset.teacherPage;
if (teacherPage) {
  document.querySelectorAll('[data-teacher-page]').forEach((link) => {
    const isActive = link.dataset.teacherPage === teacherPage;
    link.classList.toggle('selected', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  renderTeacherScores();
  updateTeacherCounts();
}
document.getElementById('teacherMenuButton')?.addEventListener('click', () => {
  document.body.classList.toggle('teacher-menu-open');
});

const messages = {
  english: {
    initials: 'MJ',
    sender: 'Mrs. Joshua',
    subject: 'English Language assignment reminder',
    time: 'Today, 10:42 AM',
    body: 'Hello Allen,\n\nPlease remember to bring your favourite author assignment to English Language class tomorrow. Make sure your response includes the author’s name, two books they have written, and why you enjoy their work.\n\nBest wishes,\nMrs. Joshua',
    avatar: 'avatar-red',
  },
  sports: {
    initials: 'SC',
    sender: 'School office',
    subject: 'Reminder: inter-house sports day',
    time: 'Yesterday, 3:15 PM',
    body: 'Dear Allen,\n\nInter-house sports day will take place on Friday, 20 September, from 8:00 AM on the school field. Please arrive in your house colours and bring water. Students should report to their house captains when they arrive.\n\nBloombreed Schools Office',
    avatar: 'avatar-blue',
  },
  maths: {
    initials: 'MB',
    sender: 'Mr. Boma',
    subject: 'Your mathematics feedback is ready',
    time: '08 September, 4:20 PM',
    body: 'Hi Allen,\n\nYour feedback on the quadratic equations practice is now available. You made a strong start with factorisation. Please review question 6 before our next lesson and bring any questions to class.\n\nKeep up the good work,\nMr. Boma',
    avatar: 'avatar-gold',
  },
};

const messageDetail = document.getElementById('messageDetail');
if (messageDetail) {
  const customMessages = JSON.parse(localStorage.getItem(studentMessagesKey) || '[]');
  if (!Array.isArray(customMessages)) {
    showToast('Saved messages could not be read.');
  } else {
    customMessages.forEach((message, index) => {
      if (message.recipient !== localStorage.getItem(studentNameKey)) return;
      const item = document.createElement('button');
      item.className = 'message-item unread';
      item.dataset.customMessage = String(index);
      const avatar = document.createElement('span');
      avatar.className = 'avatar avatar-blue';
      avatar.textContent = message.sender.slice(0, 2).toUpperCase();
      const summary = document.createElement('span');
      const sender = document.createElement('strong');
      sender.textContent = message.sender;
      const subject = document.createElement('small');
      subject.textContent = message.subject;
      summary.append(sender, subject);
      const time = document.createElement('time');
      time.textContent = message.time;
      item.append(avatar, summary, time);
      document.querySelector('.message-list')?.prepend(item);

      item.addEventListener('click', () => {
        messageDetail.className = 'message-detail';
        messageDetail.replaceChildren();
        const heading = document.createElement('div');
        heading.className = 'message-detail-head';
        const senderAvatar = document.createElement('div');
        senderAvatar.className = 'avatar avatar-blue';
        senderAvatar.textContent = message.sender.slice(0, 2).toUpperCase();
        const senderInfo = document.createElement('div');
        const senderName = document.createElement('strong');
        senderName.textContent = message.sender;
        const sentTime = document.createElement('small');
        sentTime.textContent = message.time;
        senderInfo.append(senderName, sentTime);
        heading.append(senderAvatar, senderInfo);
        const messageSubject = document.createElement('p');
        messageSubject.className = 'message-subject';
        messageSubject.textContent = message.subject;
        const body = document.createElement('p');
        body.className = 'message-body';
        body.textContent = message.body;
        messageDetail.append(heading, messageSubject, body);
        document.querySelectorAll('.message-item').forEach((messageItem) => messageItem.classList.remove('selected'));
        item.classList.add('selected');
        item.classList.remove('unread');
      });
    });
  }
}

document.querySelectorAll('.message-item[data-message]').forEach((item) => {
  item.addEventListener('click', () => {
    const message = messages[item.dataset.message];
    if (!message || !messageDetail) return;

    messageDetail.className = 'message-detail';
    messageDetail.innerHTML = `<div class="message-detail-head"><div class="avatar ${message.avatar}">${message.initials}</div><div><strong>${message.sender}</strong><small>${message.time}</small></div><button class="message-reply" data-toast="Reply window opened">Reply ↩</button></div><p class="message-subject">${message.subject}</p><p class="message-body">${message.body.replaceAll('\n', '<br>')}</p>`;
    document.querySelectorAll('.message-item').forEach((messageItem) => messageItem.classList.remove('selected'));
    item.classList.add('selected');
    item.classList.remove('unread');
    messageDetail.querySelector('[data-toast]').addEventListener('click', () => showToast('Reply window opened'));
  });
});

async function teacherUpdateScore(studentId, subject, assessment, score) {
  try {
    const { data, error } = await _supabase
      .from('scores')
      .insert({
        student_id: studentId,
        subject,
        assessment,
        score,
      })
      .select('id')
      .single();
    if (error) {
      console.error('Error saving score:', error);
      return { success: false, id: null };
    }
    if (!data || data.id === undefined || data.id === null) {
      console.error('Score was inserted, but Supabase did not return its ID.');
      return { success: false, id: null };
    }
    return { success: true, id: data.id };
  } catch (error) {
    console.error('Could not reach Supabase while saving score:', error);
    return { success: false, id: null };
  }
}

async function teacherDeleteScore(scoreId) {
  try {
    const { data, error } = await _supabase
      .from('scores')
      .delete()
      .eq('id', scoreId)
      .select('id');
    if (error) {
      console.error('Error deleting score:', error);
      return false;
    }
    if (!data.length) {
      console.error('Supabase did not delete the score; check the delete policy and score ID.');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Could not reach Supabase while deleting score:', error);
    return false;
  }
}

async function studentLoadScore(studentId) {
  try {
    const { data, error } = await _supabase
      .from('scores')
      .select('subject, assessment, score, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching score:', error);
      renderStudentScores(studentId, null, true);
      showToast('Could not load scores from Supabase.');
      return;
    }
    renderStudentScores(studentId, data || []);
  } catch (error) {
    console.error('Could not reach Supabase while loading score:', error);
    renderStudentScores(studentId, null, true);
    showToast('Could not load scores from Supabase.');
  }
}