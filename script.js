const sidebar = document.getElementById('sidebar');
const toast = document.getElementById('toast');
const currentPage = document.body.dataset.page;

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
