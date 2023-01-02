window.addEventListener("load", function (event) { 
 const es = new EventSource("http://localhost:7000/events/datetime");
 
 es.addEventListener("message", function(event) {
  const newElement = document.createElement("li");
  const eventList = document.getElementById("list");

  newElement.textContent = event.data;
  eventList.innerHTML=''
  eventList.appendChild(newElement);
 });
 
});
