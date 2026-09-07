const menuButton = document.getElementById('menuButton');
const sidebar = document.getElementById('sidebar');
const toast = document.getElementById('toast');
const dashboardPage = document.getElementById('dashboardPage');
const pageViews = {
  timetable: document.getElementById('fullTimetablePage'),
  assignments: document.getElementById('assignmentsPage'),
  results: document.getElementById('resultsPage'),
  resources: document.getElementById('resourcesPage'),
  messages: document.getElementById('messagesPage'),
  events: document.getElementById('eventsPage'),
  settings: document.getElementById('settingsPage'),
};

function showPage(pageName, event) {
  event?.preventDefault();

  dashboardPage.hidden = pageName !== 'dashboard';
  Object.entries(pageViews).forEach(([name, page]) => {
    page.hidden = name !== pageName;
  });

  document.querySelectorAll('.nav-item[data-page]').forEach((item) => {
    item.classList.toggle('active', item.dataset.page === pageName);
  });

  sidebar.classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

menuButton.addEventListener('click', () => sidebar.classList.toggle('open'));
document.querySelectorAll('.nav-item[data-page]').forEach((item) => {
  item.addEventListener('click', (event) => showPage(item.dataset.page, event));
});
document.getElementById('fullTimetableButton').addEventListener('click', (event) => showPage('timetable', event));
document.getElementById('backToDashboard').addEventListener('click', () => showPage('dashboard'));

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2600);
}

document.getElementById('scheduleButton').addEventListener('click', () => showToast('Added to your schedule'));
document.getElementById('viewTasks').addEventListener('click', () => document.getElementById('assignments').scrollIntoView({ behavior: 'smooth' }));
document.getElementById('assignmentButton').addEventListener('click', () => showToast('All assignments are up to date'));
document.getElementById('downloadTimetable').addEventListener('click', () => showToast('Timetable download is ready'));
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
    messageDetail.className = 'message-detail';
    messageDetail.innerHTML = `<div class="message-detail-head"><div class="avatar ${message.avatar}">${message.initials}</div><div><strong>${message.sender}</strong><small>${message.time}</small></div><button class="message-reply" data-toast="Reply window opened">Reply ↩</button></div><p class="message-subject">${message.subject}</p><p class="message-body">${message.body.replaceAll('\n', '<br>')}</p>`;
    document.querySelectorAll('.message-item').forEach((messageItem) => messageItem.classList.remove('selected'));
    item.classList.add('selected');
    item.classList.remove('unread');
    messageDetail.querySelector('[data-toast]').addEventListener('click', () => showToast('Reply window opened'));
  });
});