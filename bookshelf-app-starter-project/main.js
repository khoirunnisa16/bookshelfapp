let books = [];

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("bookForm");
  const searchForm = document.getElementById("searchBook");

  form.addEventListener("submit", addBook);
  searchForm.addEventListener("submit", searchBook);

  loadBooks();
});

function addBook(event) {
  event.preventDefault();

  const title = document.getElementById("bookFormTitle").value.trim();
  const author = document.getElementById("bookFormAuthor").value.trim();
  const year = Number(document.getElementById("bookFormYear").value);
  const isComplete = document.getElementById("bookFormIsComplete").checked;

  if (!title || !author || !year) {
    showPopup("Harap isi semua data buku!", "error", "Gagal Menambahkan");
    return;
  }

  const newBook = {
    id: +new Date(),
    title,
    author,
    year,
    isComplete,
  };

  books.push(newBook);
  saveBooks();
  renderBooks();

  event.target.reset();

  const statusText = isComplete ? "Selesai dibaca" : "Belum selesai dibaca";
  showPopup(
    `Buku "${title}" berhasil ditambahkan ke rak ${statusText}!`,
    "success",
    "Buku Ditambahkan"
  );
}

function saveBooks() {
  localStorage.setItem("books", JSON.stringify(books));
}

function loadBooks() {
  const data = localStorage.getItem("books");
  if (data) {
    books = JSON.parse(data);
  }
  renderBooks();
}

function renderBooks(filteredBooks = books) {
  const incompleteBookList = document.getElementById("incompleteBookList");
  const completeBookList = document.getElementById("completeBookList");

  incompleteBookList.innerHTML = "";
  completeBookList.innerHTML = "";

  for (const book of filteredBooks) {
    const bookElement = document.createElement("div");
    bookElement.setAttribute("data-bookid", book.id);
    bookElement.setAttribute("data-testid", "bookItem");

    bookElement.innerHTML = `
      <h3 data-testid="bookItemTitle">${book.title}</h3>
      <p data-testid="bookItemAuthor">Penulis: ${book.author}</p>
      <p data-testid="bookItemYear">Tahun: ${book.year}</p>
      <div>
        <button data-testid="bookItemIsCompleteButton" class="btn-status">${
          book.isComplete ? "Belum selesai dibaca" : "Selesai dibaca"
        }</button>
        <button data-testid="bookItemEditButton" class="btn-edit">Edit Buku</button>
        <button data-testid="bookItemDeleteButton" class="btn-delete">Hapus Buku</button>
      </div>
    `;

    bookElement
      .querySelector('[data-testid="bookItemIsCompleteButton"]')
      .addEventListener("click", () => toggleBookStatus(book.id));

    bookElement
      .querySelector('[data-testid="bookItemDeleteButton"]')
      .addEventListener("click", () => confirmDelete(book.id));

    bookElement
      .querySelector('[data-testid="bookItemEditButton"]')
      .addEventListener("click", () => editBook(book.id));

    if (book.isComplete) {
      completeBookList.appendChild(bookElement);
    } else {
      incompleteBookList.appendChild(bookElement);
    }
  }
}

function toggleBookStatus(bookId) {
  const book = books.find((b) => b.id === bookId);
  if (book) {
    book.isComplete = !book.isComplete;
    saveBooks();
    renderBooks();

    const statusText = book.isComplete
      ? "Selesai dibaca"
      : "Belum selesai dibaca";
    showPopup(
      `Buku "${book.title}" dipindahkan ke rak ${statusText}!`,
      "info",
      "Status Buku Diperbarui"
    );
  }
}

function confirmDelete(bookId) {
  const book = books.find((b) => b.id === bookId);
  if (!book) return;

  showConfirmPopup(
    `Yakin ingin menghapus buku "${book.title}"?`,
    () => {
      books = books.filter((b) => b.id !== bookId);
      saveBooks();
      renderBooks();
      showPopup(`"${book.title}" berhasil dihapus!`, "error", "Buku Dihapus");
    },
    () => {
      showPopup("Penghapusan dibatalkan.", "info", "Dibatalkan");
    }
  );
}

function editBook(bookId) {
  const book = books.find((b) => b.id === bookId);
  if (!book) return;

  document.getElementById("editBookId").value = book.id;
  document.getElementById("editBookTitle").value = book.title;
  document.getElementById("editBookAuthor").value = book.author;
  document.getElementById("editBookYear").value = book.year;

  const editPopup = document.getElementById("editPopup");
  editPopup.style.display = "flex";

  document.getElementById("editPopup-close").onclick = () => {
    editPopup.style.display = "none";
  };

  const editForm = document.getElementById("editBookForm");
  editForm.onsubmit = (e) => {
    e.preventDefault();

    const updatedTitle = document.getElementById("editBookTitle").value.trim();
    const updatedAuthor = document
      .getElementById("editBookAuthor")
      .value.trim();
    const updatedYear = Number(
      document.getElementById("editBookYear").value.trim()
    );

    if (!updatedTitle || !updatedAuthor || !updatedYear) {
      showPopup("Harap isi semua data buku!", "error", "Gagal Edit");
      return;
    }

    book.title = updatedTitle;
    book.author = updatedAuthor;
    book.year = updatedYear;

    saveBooks();
    renderBooks();
    editPopup.style.display = "none";

    showPopup(
      `Buku "${book.title}" berhasil diperbarui!`,
      "success",
      "Edit Berhasil"
    );
  };
}

function searchBook(event) {
  event.preventDefault();
  const keyword = document
    .getElementById("searchBookTitle")
    .value.toLowerCase()
    .trim();

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(keyword)
  );

  renderBooks(filteredBooks);

  if (filteredBooks.length === 0) {
    showPopup(
      `Tidak ditemukan buku dengan judul mengandung "${keyword}".`,
      "info",
      "Hasil Pencarian"
    );
  }
}

function showPopup(message, type = "info", title = "Notifikasi") {
  const popup = document.getElementById("popup");
  const titleEl = document.getElementById("popup-title");
  const messageEl = document.getElementById("popup-message");

  popup.className = "popup";
  popup.classList.add(type);

  titleEl.textContent = title;
  messageEl.textContent = message;
  popup.style.display = "flex";

  document.getElementById("popup-ok").onclick = () => {
    popup.style.display = "none";
  };
  document.getElementById("popup-close").onclick = () => {
    popup.style.display = "none";
  };
}

function showConfirmPopup(message, onConfirm, onCancel) {
  const popup = document.createElement("div");
  popup.className = "popup";
  popup.style.display = "flex";
  popup.innerHTML = `
    <div class="popup-content">
      <h2>Konfirmasi</h2>
      <p>${message}</p>
      <div style="display:flex; justify-content:center; gap:10px; margin-top:10px;">
        <button id="confirm-yes" style="background:#4caf50;">Ya</button>
        <button id="confirm-no" style="background:#f44336;">Batal</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  const removePopup = () => document.body.removeChild(popup);

  popup.querySelector("#confirm-yes").onclick = () => {
    removePopup();
    if (onConfirm) onConfirm();
  };
  popup.querySelector("#confirm-no").onclick = () => {
    removePopup();
    if (onCancel) onCancel();
  };
}
