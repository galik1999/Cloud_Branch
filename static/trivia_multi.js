const socketConnection = io();

socketConnection.on('room_created', function(data) {
    console.log('New room created:', data);
    addTableData(data);
});
const createRoom = (e) => {
    e.preventDefault();
    const roomName = document.getElementById('roomname').value;
    const RoomOwner = document.getElementById("RoomCreate").dataset.owner;
    socketConnection.emit('create_room', {room_name:roomName,owner:RoomOwner})
}

const addTableData = (data) => {
    const table = document.getElementById("gamesTable");
    const lastRow = table.insertRow(-1); // Will insert at the last
    const cells = []
    for(let i = 0; i < 4; i++)
    {
        cells.push(lastRow.insertCell(i));
    }
    cells[0].innerHTML = data["RoomNumber"]
    cells[1].innerHTML = data["RoomName"]
    cells[2].innerHTML = data["RoomOwner"]
    cells[3].innerHTML = "Button"
}
