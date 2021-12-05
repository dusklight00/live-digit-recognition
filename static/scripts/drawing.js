const canvas = document.querySelector(".drawing_board");
const context = canvas.getContext("2d")

const stroke = {
    color : "#000",
    size : 20
}
const frame_rate = 60

let mousedown = false;
let mouse_coord = {
    x : 0,
    y : 0
}

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight - 10;

window.addEventListener('resize', (e) => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight - 10;
}, true);
canvas.addEventListener("mousemove", e => {
    mouse_coord.x = (e.offsetX / canvas.offsetWidth) * canvas.width;
    mouse_coord.y = (e.offsetY / canvas.offsetHeight) * canvas.height;
})
canvas.addEventListener("mousedown", e => mousedown = true )
canvas.addEventListener("mouseup", e => mousedown = false )

mouse_coord_sequence = {
    last : null,
    current : null
}

function shift_mouse_coord_sequence() {
    if (mouse_coord_sequence.current != null) {
        mouse_coord_sequence.last = { ...mouse_coord_sequence.current }
    }
    mouse_coord_sequence.current = { ...mouse_coord }
}


function render_loop() {
    if (mousedown) {
        shift_mouse_coord_sequence();
    } 
    if (!mousedown) {
        mouse_coord_sequence.last = null;
        mouse_coord_sequence.current = null;
    }

    if(mouse_coord_sequence.last != null && mouse_coord_sequence.current != null) {
        context.beginPath();
        context.lineWidth = stroke.size
        context.lineCap = "round"
        context.moveTo(
            mouse_coord_sequence.last.x,
            mouse_coord_sequence.last.y
        )
        context.lineTo(
            mouse_coord_sequence.current.x,
            mouse_coord_sequence.current.y
        )
        context.strokeStyle = stroke.color;
        context.stroke();
    }
}

function clear_canvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

setInterval(render_loop, (1000 / frame_rate))