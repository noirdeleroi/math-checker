let data = [];
let currentIndex = -1;
let activeField = null;

window.onload = function () {
  document.getElementById("csvFileInput").addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        data = results.data;
        populateSelectMenu();
        clearUI();
      }
    });
  });

  document.querySelectorAll(".data-box").forEach((box) => {
    box.addEventListener("click", function () {
      if (currentIndex === -1) return;
      const field = box.getAttribute("data-field");
      if (!field) return;
      activeField = field;
      document.getElementById("editBox").value = data[currentIndex][field] || "";
    });
  });

  document.getElementById("editBox").addEventListener("input", function () {
    if (activeField && currentIndex !== -1) {
      data[currentIndex][activeField] = this.value;
      displayRow(); // refresh rendering
    }
  });
};

function populateSelectMenu() {
  const select = document.getElementById("questionSelect");
  select.innerHTML = "<option value=\"\">-- Select --</option>";
  data.forEach((row, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.text = row.question_id || `Row ${index}`;
    select.appendChild(option);
  });
}

function selectById() {
  const select = document.getElementById("questionSelect");
  const index = parseInt(select.value);
  if (!isNaN(index)) {
    currentIndex = index;
    activeField = null;
    displayRow();
  }
}


function displayRow() {
  if (currentIndex < 0 || currentIndex >= data.length) return;
  const row = data[currentIndex];

  document.querySelectorAll(".data-box").forEach((box) => {
    const field = box.getAttribute("data-field");
    const content = row[field] || "";
    box.textContent = content;

    // Only render LaTeX in the first two columns (left and middle)
    const parentId = box.parentElement.id;
    if (parentId === "leftColumn" || parentId === "middleColumn") {
      MathJax.typesetPromise([box]);
    }
  });

  // Update editor with raw content
  if (activeField) {
    document.getElementById("editBox").value = row[activeField] || "";
  } else {
    document.getElementById("editBox").value = "";
  }
}



function clearUI() {
  document.querySelectorAll(".data-box").forEach((box) => {
    box.innerHTML = "";
  });
  document.getElementById("editBox").value = "";
}

function nextRow() {
  if (currentIndex < data.length - 1) {
    currentIndex++;
    document.getElementById("questionSelect").value = currentIndex;
    displayRow();
  }
}

function prevRow() {
  if (currentIndex > 0) {
    currentIndex--;
    document.getElementById("questionSelect").value = currentIndex;
    displayRow();
  }
}

function downloadCSV() {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "questiondb_updated.csv";
  link.click();
}
