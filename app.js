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
    const today = new Date().toISOString().split('T')[0];
    const templates = getData(STORAGE_KEYS.TEMPLATES);
    if (!templates.length) return alert('Aucun template trouvé');
  
    const templateName = prompt("Quel template utiliser ? (nom exact)");
    const template = templates.find(t => t.name === templateName);
    if (!template) return alert('Template introuvable');
  
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
  
  // === Gérer les exercices ===
  function createExercise() {
    const name = prompt("Nom de l'exercice");
    const sets = prompt("Nombre de séries", "3");
    const reps = prompt("Nombre de répétitions", "10");
    const weight = prompt("Poids (kg)", "0");
    const muscles = prompt("Groupes musculaires (ex: dos, biceps)");
  
    if (!name) return;
    const exercises = getData(STORAGE_KEYS.EXERCISES);
    exercises.push({ name, sets, reps, weight, muscles, history: [] });
    saveData(STORAGE_KEYS.EXERCISES, exercises);
    alert('Exercice ajouté.');
  }
  
  function createTemplate() {
    const name = prompt("Nom du template");
    const availableExercises = getData(STORAGE_KEYS.EXERCISES);
    if (!availableExercises.length) return alert("Ajoutez d'abord des exercices.");
  
    const exoNames = prompt("Quels exercices ? (séparés par une virgule, noms exacts)");
    const selected = exoNames.split(',').map(n => n.trim());
  
    const exercises = availableExercises.filter(e => selected.includes(e.name));
    if (!exercises.length) return alert("Aucun exercice trouvé.");
  
    const templates = getData(STORAGE_KEYS.TEMPLATES);
    templates.push({ name, exercises });
    saveData(STORAGE_KEYS.TEMPLATES, templates);
    alert('Template créé.');
  }
  
  // === Listeners ===
  document.getElementById('start-workout').addEventListener('click', startNewSession);
  document.getElementById('nav-exercises').addEventListener('click', createExercise);
  document.getElementById('nav-templates').addEventListener('click', createTemplate);
  
  // === Initialisation ===
  renderWeekCalendar();
  
