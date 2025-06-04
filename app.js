// === Données simulées dans localStorage ===
const STORAGE_KEYS = {
  EXERCISES: 'exercises',
  TEMPLATES: 'templates',
  SESSIONS: 'sessions',
};

const getData = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const saveData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// === Génération de la semaine ===
function renderWeekCalendar() {
  const calendar = document.querySelector('.calendar');
  calendar.innerHTML = '';
  const now = new Date();
  const start = now.getDate() - now.getDay();

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(start + i);
    const dayName = d.toLocaleDateString('fr-FR', { weekday: 'short' });
    const day = d.getDate();
    const dateStr = d.toISOString().split('T')[0];

    const div = document.createElement('div');
    div.textContent = `${dayName} ${day}`;
    if (getData(STORAGE_KEYS.SESSIONS).some(s => s.date === dateStr)) {
      div.style.backgroundColor = '#c3f';
    }
    div.onclick = () => viewSession(dateStr);
    calendar.appendChild(div);
  }
}

// === Nouvelle séance ===
function startNewSession() {
  const templates = getData(STORAGE_KEYS.TEMPLATES);
  if (!templates.length) return alert('Aucun template trouvé');

  const templateSelect = document.getElementById('template-select');
  templateSelect.innerHTML = '<option value="">-- Choisir un template --</option>';
  templates.forEach(t => {
    const option = document.createElement('option');
    option.value = t.name;
    option.textContent = t.name;
    templateSelect.appendChild(option);
  });

  document.getElementById('template-modal').style.display = 'block';
}

function confirmTemplateSelection() {
  const select = document.getElementById('template-select');
  const templateName = select.value;
  if (!templateName) return;
  const template = getData(STORAGE_KEYS.TEMPLATES).find(t => t.name === templateName);
  if (!template) return;

  const today = new Date().toISOString().split('T')[0];
  const newSession = {
    id: Date.now(),
    date: today,
    duration: 0,
    template: template.name,
    exercises: template.exercises.map(e => ({ ...e })),
  };

  const sessions = getData(STORAGE_KEYS.SESSIONS);
  sessions.push(newSession);
  saveData(STORAGE_KEYS.SESSIONS, sessions);
  document.getElementById('template-modal').style.display = 'none';
  renderWorkoutList(newSession);
  renderWeekCalendar();
}

function renderWorkoutList(session) {
  const list = document.getElementById('workout-list');
  list.innerHTML = '';
  session.exercises.forEach(e => {
    const item = document.createElement('div');
    item.textContent = `${e.name}: ${e.sets} x ${e.reps} @ ${e.weight}kg`;
    list.appendChild(item);
  });
}

function viewSession(dateStr) {
  const sessions = getData(STORAGE_KEYS.SESSIONS);
  const session = sessions.find(s => s.date === dateStr);
  if (!session) return alert("Pas de séance ce jour-là");
  renderWorkoutList(session);
}

function showExerciseForm() {
  document.getElementById('exercise-form').reset();
  document.getElementById('exercise-modal').style.display = 'block';
}

function saveExercise(event) {
  event.preventDefault();
  const form = event.target;
  const exercises = getData(STORAGE_KEYS.EXERCISES);
  exercises.push({
    name: form.name.value,
    sets: form.sets.value,
    reps: form.reps.value,
    weight: form.weight.value,
    muscles: form.muscles.value,
    history: []
  });
  saveData(STORAGE_KEYS.EXERCISES, exercises);
  document.getElementById('exercise-modal').style.display = 'none';
  alert('Exercice ajouté.');
}

function showTemplateForm() {
  const container = document.getElementById('template-exercise-options');
  container.innerHTML = '';
  const allExercises = getData(STORAGE_KEYS.EXERCISES);
  allExercises.forEach(e => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'exercises';
    checkbox.value = e.name;
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(e.name));
    container.appendChild(label);
  });
  document.getElementById('template-modal-create').style.display = 'block';
}

function saveTemplate(event) {
  event.preventDefault();
  const form = event.target;
  const selected = Array.from(form.exercises).filter(cb => cb.checked).map(cb => cb.value);
  const allExercises = getData(STORAGE_KEYS.EXERCISES);
  const selectedExercises = allExercises.filter(e => selected.includes(e.name));
  const templates = getData(STORAGE_KEYS.TEMPLATES);
  templates.push({ name: form.templateName.value, exercises: selectedExercises });
  saveData(STORAGE_KEYS.TEMPLATES, templates);
  document.getElementById('template-modal-create').style.display = 'none';
  alert('Template créé.');
}

// === Listeners ===
document.getElementById('start-workout').addEventListener('click', startNewSession);
document.getElementById('confirm-template').addEventListener('click', confirmTemplateSelection);
document.getElementById('nav-exercises').addEventListener('click', showExerciseForm);
document.getElementById('exercise-form').addEventListener('submit', saveExercise);
document.getElementById('nav-templates').addEventListener('click', showTemplateForm);
document.getElementById('template-form').addEventListener('submit', saveTemplate);

// === Initialisation ===
renderWeekCalendar();
