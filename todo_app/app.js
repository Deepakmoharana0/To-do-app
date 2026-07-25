// ─────────────────────────────────────────────────────────────
// "e" is just a short name for React.createElement, so the code
// below isn't cluttered. This is what JSX turns into behind the
// scenes anyway — we're just writing it directly, by hand.
//
// e(tag, props, ...children)
//   tag      → 'div', 'button', 'input'... OR another component function
//   props    → an object: { className, onClick, value, ... }
//   children → whatever goes inside that element
// ─────────────────────────────────────────────────────────────
const e = React.createElement;
const { useState, useEffect } = React; // Hooks, pulled out of the React object


// ============================================================
// COMPONENT: TaskItem
// One single task row. Receives data + functions via PROPS.
// ============================================================
function TaskItem(props) {
  const { task, onToggleComplete, onDeleteTask, onEditTask } = props; // destructuring props

  // STATE: does this task show an edit box right now?
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  // EVENT HANDLING: runs when "Save" is clicked
  function handleSave() {
    if (editText.trim() === '') return;
    onEditTask(task.id, editText);
    setIsEditing(false);
  }

  return e(
    'div',
    { className: 'task-item' + (task.completed ? ' completed' : '') },

    // Checkbox — toggles completed
    e('input', {
      type: 'checkbox',
      checked: task.completed,
      onChange: function () { onToggleComplete(task.id); }
    }),

    // Conditional rendering: edit input OR plain text
    isEditing
      ? e('input', {
          type: 'text',
          className: 'edit-input',
          value: editText,
          onChange: function (event) { setEditText(event.target.value); }
        })
      : e('span', { className: 'task-text' }, task.text),

    // Status label
    e('span', { className: 'task-status' }, task.completed ? '✅ Completed' : '⏳ Pending'),

    // Action buttons
    e(
      'div',
      { className: 'task-actions' },
      isEditing
        ? e('button', { onClick: handleSave }, 'Save')
        : e('button', { onClick: function () { setIsEditing(true); } }, 'Edit'),
      e('button', { onClick: function () { onDeleteTask(task.id); } }, 'Delete')
    )
  );
}


// ============================================================
// COMPONENT: TaskList
// Loops over the tasks array with .map() and renders a TaskItem
// for each one. Passes functions further down as props.
// ============================================================
function TaskList(props) {
  const { tasks, onToggleComplete, onDeleteTask, onEditTask } = props;

  return e(
    'div',
    { className: 'task-list' },
    tasks.map(function (task) {
      return e(TaskItem, {
        key: task.id, // React needs a unique key for list items
        task: task,
        onToggleComplete: onToggleComplete,
        onDeleteTask: onDeleteTask,
        onEditTask: onEditTask
      });
    })
  );
}


// ============================================================
// COMPONENT: TaskForm
// The input box + Add button. Manages its own local STATE for
// whatever the user is currently typing.
// ============================================================
function TaskForm(props) {
  const { onAddTask } = props;
  const [text, setText] = useState('');

  function handleSubmit(event) {
    event.preventDefault(); // stop the page from refreshing
    if (text.trim() === '') return;
    onAddTask(text);
    setText('');
  }

  return e(
    'form',
    { className: 'task-form', onSubmit: handleSubmit },
    e('input', {
      type: 'text',
      placeholder: 'Add a new task...',
      value: text,
      onChange: function (event) { setText(event.target.value); }
    }),
    e('button', { type: 'submit' }, 'Add')
  );
}


// ============================================================
// COMPONENT: App
// The top-level component. Holds the main STATE (the tasks
// array) and all the logic. Everything else is a child of this.
// ============================================================
function App() {
  // STATE: the tasks array, loaded from Local Storage if available
  const [tasks, setTasks] = useState(function () {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });

  // STATE: which filter is active
  const [filter, setFilter] = useState('all');

  // HOOK: useEffect runs automatically whenever "tasks" changes,
  // saving the updated list to Local Storage.
  useEffect(function () {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  function addTask(text) {
    const newTask = { id: Date.now(), text: text, completed: false };
    setTasks([...tasks, newTask]); // spread operator: copy old tasks + add new one
  }

  function toggleComplete(id) {
    setTasks(
      tasks.map(function (task) {
        return task.id === id ? { ...task, completed: !task.completed } : task;
      })
    );
  }

  function deleteTask(id) {
    setTasks(tasks.filter(function (task) { return task.id !== id; }));
  }

  function editTask(id, newText) {
    setTasks(
      tasks.map(function (task) {
        return task.id === id ? { ...task, text: newText } : task;
      })
    );
  }

  // Derived data: recalculated every render, not stored as state
  const filteredTasks = tasks.filter(function (task) {
    if (filter === 'completed') return task.completed === true;
    if (filter === 'pending') return task.completed === false;
    return true;
  });

  return e(
    'div',
    { className: 'app' },
    e('h1', null, 'My To-Do List'),

    e(TaskForm, { onAddTask: addTask }),

    e(
      'div',
      { className: 'filters' },
      e('button', {
        className: filter === 'all' ? 'active' : '',
        onClick: function () { setFilter('all'); }
      }, 'All'),
      e('button', {
        className: filter === 'pending' ? 'active' : '',
        onClick: function () { setFilter('pending'); }
      }, 'Pending'),
      e('button', {
        className: filter === 'completed' ? 'active' : '',
        onClick: function () { setFilter('completed'); }
      }, 'Completed')
    ),

    e(TaskList, {
      tasks: filteredTasks,
      onToggleComplete: toggleComplete,
      onDeleteTask: deleteTask,
      onEditTask: editTask
    }),

    tasks.length === 0
      ? e('p', { className: 'empty-state' }, 'No tasks yet — add one above!')
      : null
  );
}


// ============================================================
// Mount the App into the <div id="root"> in index.html
// ============================================================
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(e(App));
