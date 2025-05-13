document.addEventListener("DOMContentLoaded", () => {
  const tareas = JSON.parse(localStorage.getItem("tareas")) || [];

  const columnas = {
    todo: document.getElementById("todo"),
    inProgress: document.getElementById("inProgress"),
    done: document.getElementById("done")
  };

  const form = document.getElementById("tarea-form");
  const modal = document.getElementById("modal-tarea");
  const btnCrear = document.getElementById("btn-crear");
  const closeBtn = document.querySelector(".close-btn");
  const eliminarBtn = document.getElementById("eliminar-tarea");
  const resumenGrid = document.getElementById("resumen-grid");
  const calendar = document.getElementById("calendar");

  let tareaEditando = null;

  const guardarTareas = () => localStorage.setItem("tareas", JSON.stringify(tareas));

  const renderizarTareas = () => {
    Object.values(columnas).forEach(col => col.querySelectorAll(".tarea").forEach(el => el.remove()));

    tareas.forEach(tarea => {
      const div = document.createElement("div");
      div.className = "tarea";
      div.style.border = "1px solid #ccc";
      div.style.borderRadius = "8px";
      div.style.padding = "10px";
      div.style.margin = "10px 0";
      div.style.backgroundColor = "#f8f9fa";
      div.style.cursor = "pointer";
      div.setAttribute("draggable", true);

      div.innerHTML = `<h4>${tarea.titulo}</h4><p>${tarea.descripcion}</p>`;

      div.onclick = () => {
        tareaEditando = tarea;
        document.getElementById("tarea-id").value = tarea.id;
        document.getElementById("titulo").value = tarea.titulo;
        document.getElementById("descripcion").value = tarea.descripcion;
        document.getElementById("fechaInicio").value = tarea.fechaInicio;
        document.getElementById("fechaFin").value = tarea.fechaFin;
        document.getElementById("estado").value = tarea.estado;
        eliminarBtn.classList.remove("hidden");
        modal.classList.add("visible");
      };

      div.ondragstart = (e) => {
        e.dataTransfer.setData("text/plain", tarea.id);
      };

      columnas[tarea.estado].appendChild(div);
    });

    renderizarResumen();
    renderizarCalendario();
  };

  form.onsubmit = e => {
    e.preventDefault();
    const titulo = document.getElementById("titulo").value;
    const descripcion = document.getElementById("descripcion").value;
    const fechaInicio = document.getElementById("fechaInicio").value;
    const fechaFin = document.getElementById("fechaFin").value;
    const estado = document.getElementById("estado").value;

    if (tareaEditando) {
      Object.assign(tareaEditando, { titulo, descripcion, fechaInicio, fechaFin, estado });
    } else {
      tareas.push({
        id: Date.now(),
        titulo,
        descripcion,
        fechaInicio,
        fechaFin,
        estado
      });
    }

    guardarTareas();
    renderizarTareas();
    modal.classList.remove("visible");
    form.reset();
    eliminarBtn.classList.add("hidden");
    tareaEditando = null;
  };

  eliminarBtn.onclick = () => {
    if (tareaEditando) {
      const index = tareas.findIndex(t => t.id === tareaEditando.id);
      tareas.splice(index, 1);
      guardarTareas();
      renderizarTareas();
      modal.classList.remove("visible");
      form.reset();
      eliminarBtn.classList.add("hidden");
      tareaEditando = null;
    }
  };

  btnCrear.onclick = () => {
    modal.classList.add("visible");
    form.reset();
    tareaEditando = null;
    eliminarBtn.classList.add("hidden");
  };

  closeBtn.onclick = () => {
    modal.classList.remove("visible");
    form.reset();
    eliminarBtn.classList.add("hidden");
    tareaEditando = null;
  };

  function renderizarResumen() {
    const resumenSemanal = {};
    const hoy = new Date();
    tareas.forEach(tarea => {
      if (tarea.estado === "done" && tarea.fechaFin) {
        const fecha = new Date(tarea.fechaFin);
        const semana = `${fecha.getFullYear()}-W${getWeekNumber(fecha)}`;
        resumenSemanal[semana] = (resumenSemanal[semana] || 0) + 1;
      }
    });

    resumenGrid.innerHTML = "";
    Object.entries(resumenSemanal).forEach(([semana, count]) => {
      const div = document.createElement("div");
      div.textContent = `${semana}: ${count}`;
      div.style.backgroundColor = "#28a745";
      div.style.color = "white";
      div.style.padding = "8px";
      div.style.borderRadius = "5px";
      resumenGrid.appendChild(div);
    });
  }

  function getWeekNumber(date) {
    const firstJan = new Date(date.getFullYear(), 0, 1);
    return Math.ceil((((date - firstJan) / 86400000) + firstJan.getDay() + 1) / 7);
  }

  function renderizarCalendario() {
    calendar.innerHTML = "";
    const dias = new Set(
      tareas
        .filter(t => t.estado === "done" && t.fechaFin)
        .map(t => new Date(t.fechaFin).toISOString().split("T")[0])
    );

    for (let d = 1; d <= 31; d++) {
      const diaStr = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
      const div = document.createElement("div");
      div.className = "calendar-day";
      div.textContent = d;
      if (dias.has(diaStr)) div.classList.add("completed");
      calendar.appendChild(div);
    }
  }

  // Eventos de arrastrar y soltar
  const permitirDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const soltarTarea = (e, estadoDestino) => {
    e.preventDefault();
    e.stopPropagation();

    const tareaId = e.dataTransfer.getData("text/plain");
    const tarea = tareas.find(t => t.id === parseInt(tareaId));

    if (tarea) {
      tarea.estado = estadoDestino;
      guardarTareas();
      renderizarTareas();
    }
  };

  Object.keys(columnas).forEach(estado => {
    const columna = columnas[estado];
    columna.ondragover = permitirDrop;
    columna.ondrop = (e) => soltarTarea(e, estado);
  });

  renderizarTareas();
});
