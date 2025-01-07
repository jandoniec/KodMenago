import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      return JSON.parse(savedTasks).map((task) => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        completionDate: task.completionDate ? new Date(task.completionDate) : null,
      }));
    }
    return [];
  });

  const [newTask, setNewTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [taskType, setTaskType] = useState('Feature');
  const [priority, setPriority] = useState('Średni');

  const teamMembers = ['Juan', 'Antoni', 'Zosia', 'Robert', 'Marta'];

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

  const addTask = () => {
    if (newTask.trim() && dueDate && assignedTo) {
      const taskDate = new Date(dueDate);
      taskDate.setHours(0, 0, 0, 0);
      setTasks([
        ...tasks,
        {
          id: generateId(),
          text: newTask,
          assignedTo,
          taskType,
          priority,
          status: 'todo',
          dueDate: taskDate,
          completionDate: null,
        },
      ]);
      setNewTask('');
      setDueDate('');
      setAssignedTo('');
      setTaskType('Feature');
      setPriority('Średni');
    } else {
      alert('Uzupełnij wszystkie pola przed dodaniem zadania!');
    }
  };

  const changeStatus = (id, newStatus) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id
        ? {
            ...task,
            status: newStatus,
            completionDate: newStatus === 'done' ? new Date() : task.completionDate,
          }
        : task
    );
    setTasks(updatedTasks);
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <div className="App">
      <h1 className="title">💻 KodMenago - Your IT Project Management Assistant</h1>
      <div className="input-container">
        <input
          type="text"
          placeholder="Opis zadania..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
          <option value="">Wybierz członka zespołu</option>
          {teamMembers.map((member) => (
            <option key={member} value={member}>
              {member}
            </option>
          ))}
        </select>
        <select value={taskType} onChange={(e) => setTaskType(e.target.value)}>
          <option value="Feature">Feature</option>
          <option value="Bug">Bug</option>
          <option value="Refactoring">Refactoring</option>
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="Wysoki">Wysoki</option>
          <option value="Średni">Średni</option>
          <option value="Niski">Niski</option>
        </select>
        <button className="add-button" onClick={addTask}>
          Dodaj Zadanie
        </button>
      </div>

      <div className="task-sections">
        <TaskSection
          title="📋 Do zrobienia"
          tasks={tasks.filter((task) => task.status === 'todo')}
          onStatusChange={changeStatus}
          deleteTask={deleteTask}
          nextStatus="in_progress"
          nextStatusLabel="Rozpocznij"
        />
        <TaskSection
          title="🕒 W trakcie"
          tasks={tasks.filter((task) => task.status === 'in_progress')}
          onStatusChange={changeStatus}
          deleteTask={deleteTask}
          dualButtons={[
            { nextStatus: 'review', label: 'Code Review' },
            { nextStatus: 'done', label: 'Zakończ' },
          ]}
        />
        <TaskSection
          title="🔍 Code Review"
          tasks={tasks.filter((task) => task.status === 'review')}
          onStatusChange={changeStatus}
          deleteTask={deleteTask}
          nextStatus="done"
          nextStatusLabel="Zakończ"
        />
        <TaskSection
          title="✅ Zakończone"
          tasks={tasks.filter((task) => task.status === 'done')}
          onStatusChange={changeStatus}
          deleteTask={deleteTask}
          nextStatus=""
          nextStatusLabel=""
        />
      </div>
    </div>
  );
}

function TaskSection({
  title,
  tasks,
  onStatusChange,
  deleteTask,
  nextStatus,
  nextStatusLabel,
  dualButtons = [],
}) {
  const formatDate = (date) => {
    if (date instanceof Date && !isNaN(date)) {
      return date.toLocaleDateString();
    }
    return 'Brak daty';
  };

  const isOverdue = (task) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today > task.dueDate;
  };

  const isApproachingDeadline = (task) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const timeDiffDays = (task.dueDate - today) / (1000 * 60 * 60 * 24);
    return timeDiffDays <= 1 && timeDiffDays >= 0;
  };

  return (
    <div className="task-section">
      <h2>{title}</h2>
      <ul className="task-list">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`task-item ${
              isOverdue(task) ? 'overdue' : isApproachingDeadline(task) ? 'approaching-deadline' : ''
            }`}
          >
            <div className="task-content">
              <span className="task-text">{task.text}</span>
              <span className="task-meta">
                Przydzielone do: {task.assignedTo} | Typ: {task.taskType} | Priorytet: {task.priority}
              </span>
              <span className="task-date">Termin: {formatDate(task.dueDate)}</span>
              {task.completionDate && (
                <span className="completion-date">
                  Zakończono: {formatDate(task.completionDate)}
                </span>
              )}
            </div>
            <div className="button-group">
              {dualButtons.length > 0
                ? dualButtons.map(({ nextStatus, label }) => (
                    <button
                      key={nextStatus}
                      className="status-button"
                      onClick={() => onStatusChange(task.id, nextStatus)}
                    >
                      {label}
                    </button>
                  ))
                : nextStatus && (
                    <button
                      className="status-button"
                      onClick={() => onStatusChange(task.id, nextStatus)}
                    >
                      {nextStatusLabel}
                    </button>
                  )}
              <button className="delete-button" onClick={() => deleteTask(task.id)}>
                ❌ Usuń
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
