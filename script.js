document.getElementById("bookingForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const date = document.getElementById("date").value;
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;

    const response = await fetch("/book", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ date, startTime, endTime })
    });

    const data = await response.json();
    const message = document.getElementById("message");

    if (response.ok) {
        message.style.color = "green";
        message.innerText = data.message;
    } else {
        message.style.color = "red";
        message.innerText = data.message;
    }
});