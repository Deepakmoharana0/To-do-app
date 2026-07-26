const e = React.createElement;
const { useState, useEffect } = React; 

function TaskItem(props) {
  const { task, onToggleComplete, onDeleteTask, onEditTask } = props; 

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  function handleSave() {
    if (editText.trim() === '') return;
    onEditTask(task.id, editText);
    setIsEditing(false);
  }

  return e(
    'div',
    { className: 'task-item' + (task.completed ? ' completed' : '') },

    e('input', {
      type: 'checkbox',
      checked: task.completed,
      onChange: function () { onToggleComplete(task.id); }
    }),

    isEditing
      ? e('input', {
          type: 'text',
          className: 'edit-input',
          value: editText,
          onChange: function (event) { setEditText(event.target.value); }
        })
      : e('span', { className: 'task-text' }, task.text),

    e('span', { className: 'task-status' }, task.completed ? '✅ Completed' : '⏳ Pending'),

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


function TaskList(props) {
  const { tasks, onToggleComplete, onDeleteTask, onEditTask } = props;

  return e(
    'div',
    { className: 'task-list' },
    tasks.map(function (task) {
      return e(TaskItem, {
        key: task.id, 
        task: task,
        onToggleComplete: onToggleComplete,
        onDeleteTask: onDeleteTask,
        onEditTask: onEditTask
      });
    })
  );
}

function TaskForm(props) {
  const { onAddTask } = props;
  const [text, setText] = useState('');

  function handleSubmit(event) {
    event.preventDefault(); 
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

function App() {
  const [tasks, setTasks] = useState(function () {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [filter, setFilter] = useState('all');

  useEffect(function () {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  function addTask(text) {
    const newTask = { id: Date.now(), text: text, completed: false };
    setTasks([...tasks, newTask]);
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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(e(App));
