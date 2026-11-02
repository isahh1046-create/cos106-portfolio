/* =========================================================
   Harun Isah — COS 106 Portfolio Site Scripts
   - Mobile navigation toggle
   - Scroll reveal animations
   - Interactive Academic Planner (localStorage)
   - Contact form validation
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Active nav link ---------- */
  const current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach(a => {
    if (a.getAttribute("href") === current) a.classList.add("active");
  });

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => navMenu.classList.toggle("open"));
    navMenu.querySelectorAll(".nav-link").forEach(a =>
      a.addEventListener("click", () => navMenu.classList.remove("open"))
    );
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add("visible"));
  }

  /* ---------- Skill bars ---------- */
  const fills = document.querySelectorAll(".skill-fill");
  if (fills.length && "IntersectionObserver" in window) {
    const sio = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("animate"); sio.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    fills.forEach(f => sio.observe(f));
  }

  /* ======================================================
     ACADEMIC PLANNER
     ====================================================== */
  const taskForm = document.getElementById("taskForm");
  if (taskForm) initPlanner();

  function initPlanner() {
    const input = document.getElementById("taskInput");
    const priority = document.getElementById("taskPriority");
    const list = document.getElementById("taskList");
    const emptyMsg = document.getElementById("emptyMsg");
    const errEl = document.getElementById("taskError");
    const statTotal = document.getElementById("statTotal");
    const statDone = document.getElementById("statDone");
    const statPending = document.getElementById("statPending");
    let tasks = JSON.parse(localStorage.getItem("cos106Tasks")) || [];
    let filter = "all";

    function save() { localStorage.setItem("cos106Tasks", JSON.stringify(tasks)); }

    function escapeHTML(str) {
      return str.replace(/[&<>"']/g, c =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    }

    function render() {
      const visible = tasks.filter(t =>
        filter === "all" ? true : filter === "completed" ? t.done : !t.done);

      list.innerHTML = visible.map(t => `
        <li class="task-item prio-${t.priority}${t.done ? " completed" : ""}" data-id="${t.id}">
          <input type="checkbox" class="task-check" ${t.done ? "checked" : ""} aria-label="Mark as completed">
          <span class="task-text">${escapeHTML(t.text)}</span>
          <span class="task-prio">${t.priority}</span>
          <button class="task-del" aria-label="Delete task">&#10005;</button>
        </li>`).join("");

      emptyMsg.style.display = visible.length ? "none" : "block";
      emptyMsg.textContent = tasks.length
        ? "No tasks match this filter."
        : "No tasks yet. Add your first task above!";

      statTotal.textContent = tasks.length;
      statDone.textContent = tasks.filter(t => t.done).length;
      statPending.textContent = tasks.filter(t => !t.done).length;
    }

    taskForm.addEventListener("submit", e => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) {
        errEl.textContent = "Please enter a task before adding.";
        input.focus();
        return;
      }
      errEl.textContent = "";
      tasks.unshift({ id: Date.now(), text, priority: priority.value, done: false });
      save(); render();
      input.value = "";
      input.focus();
    });

    list.addEventListener("click", e => {
      const item = e.target.closest(".task-item");
      if (!item) return;
      const id = Number(item.dataset.id);
      if (e.target.classList.contains("task-del")) {
        tasks = tasks.filter(t => t.id !== id);
      } else if (e.target.classList.contains("task-check")) {
        const task = tasks.find(t => t.id === id);
        if (task) task.done = e.target.checked;
      }
      save(); render();
    });

    document.querySelectorAll(".filter-btn[data-filter]").forEach(btn => {
      btn.addEventListener("click", () => {
        filter = btn.dataset.filter;
        document.querySelectorAll(".filter-btn[data-filter]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        render();
      });
    });

    document.getElementById("clearCompleted").addEventListener("click", () => {
      tasks = tasks.filter(t => !t.done);
      save(); render();
    });

    render();
  }

  /* ======================================================
     CONTACT FORM VALIDATION
     ====================================================== */
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    const name = document.getElementById("cName");
    const email = document.getElementById("cEmail");
    const phone = document.getElementById("cPhone");
    const msg = document.getElementById("cMsg");
    const status = document.getElementById("formStatus");

    function setError(field, errEl, message) {
      document.getElementById(errEl).textContent = message;
      field.classList.toggle("invalid", Boolean(message));
      return !message;
    }

    contactForm.addEventListener("submit", e => {
      e.preventDefault();
      let valid = true;

      valid = setError(name, "errName",
        name.value.trim() ? "" : "Name is required.") && valid;

      const emailVal = email.value.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      valid = setError(email, "errEmail",
        !emailVal ? "Email address is required."
        : !emailPattern.test(emailVal) ? "Please enter a valid email address (e.g. name@mail.com)."
        : "") && valid;

      const phoneVal = phone.value.trim();
      valid = setError(phone, "errPhone",
        !phoneVal ? "Phone number is required."
        : !/^\d+$/.test(phoneVal) ? "Phone number must contain digits only."
        : "") && valid;

      valid = setError(msg, "errMsg",
        msg.value.trim() ? "" : "Message cannot be empty.") && valid;

      if (valid) {
        status.textContent = "Thank you, " + name.value.trim().split(" ")[0] +
          "! Your message has been sent successfully.";
        status.className = "form-status success";
        contactForm.reset();
        document.querySelectorAll(".form-group input, .form-group textarea")
          .forEach(f => f.classList.remove("invalid"));
      } else {
        status.textContent = "Please correct the errors above and try again.";
        status.className = "form-status error";
      }
    });

    [name, email, phone, msg].forEach(f =>
      f.addEventListener("input", () => {
        f.classList.remove("invalid");
        document.getElementById("err" + f.id.slice(1)).textContent = "";
      }));
  }
});
