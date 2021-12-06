const canvas = document.querySelector(".drawing_board");
const context = canvas.getContext("2d")

predicted_results = []

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

draw_rect = {
    x_left: null,
    x_right: null,
    y_top: null,
    y_bottom: null
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

    if(mousedown) {
        if (draw_rect.x_left == null) {
            draw_rect.x_left = mouse_coord.x
        } else {
            draw_rect.x_left = Math.min(draw_rect.x_left, mouse_coord.x)
        }
       
        if (draw_rect.x_right == null) {
            draw_rect.x_right = mouse_coord.x
        } else {
            draw_rect.x_right = Math.max(draw_rect.x_right, mouse_coord.x)
        }

        if (draw_rect.y_top == null) {
            draw_rect.y_top = mouse_coord.y
        } else {
            draw_rect.y_top = Math.min(draw_rect.y_top, mouse_coord.y)
        }
    
        if (draw_rect.y_bottom == null) {
            draw_rect.y_bottom = mouse_coord.y
        } else {
            draw_rect.y_bottom = Math.max(draw_rect.y_bottom, mouse_coord.y)
        }

        box_width = draw_rect.x_right - draw_rect.x_left
        box_height = draw_rect.y_bottom - draw_rect.y_top

        if (box_width > box_height) {
            padding = (box_width - box_height) / 2
            draw_rect.y_top -= padding
            draw_rect.y_bottom += padding 
        } else if (box_width < box_height) {
            padding = (box_height - box_width) / 2
            draw_rect.x_left -= padding
            draw_rect.x_right += padding 
        }

        fetch_predicted_result();
        render_predicted_values();
    }
});
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
    
    draw_rect.x_left = null;
    draw_rect.x_right = null;
    draw_rect.y_top = null;
    draw_rect.y_bottom = null;

    predicted_results = [];
    render_predicted_values()
}

function get_drawn_image() {
    return new Promise(resolve => {
        const compress_image_canvas = document.querySelector("#compress_image_canvas");
        const compress_image_context = compress_image_canvas.getContext("2d");
        
        let compress_image = new Image();
        compress_image.src = canvas.toDataURL();
    
        compress_image.onload = function() {
    
            // draw cropped image
            padding = 20
            var sourceX = draw_rect.x_left - padding;
            var sourceY = draw_rect.y_top - padding;
            var sourceWidth = draw_rect.x_right - draw_rect.x_left + (2 * padding);
            var sourceHeight = draw_rect.y_bottom - draw_rect.y_top + (2 * padding);
            var destWidth = 28;
            var destHeight = 28;
            var destX = 0;
            var destY = 0;
    
            compress_image_context.clearRect(0, 0, destWidth, destHeight)
            compress_image_context.drawImage(
                compress_image, 
                sourceX, 
                sourceY, 
                sourceWidth, 
                sourceHeight, 
                destX, 
                destY, 
                destWidth, 
                destHeight
            );
            
            image_data = compress_image_context.getImageData(0, 0, destWidth, destHeight); 
            resolve(image_data.data)
        };
    })
}

async function fetch_predicted_result() {
    api_url = "/predict_digit";
    drawn_image_data = await get_drawn_image();

    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/predict_digit");
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(`image_data=${ JSON.stringify(drawn_image_data) }`)

    xhr.onload = function() {
        if(xhr.readyState === xhr.DONE) {
            if(xhr.status === 200) {
                response = JSON.parse(xhr.responseText)
                predicted_results = JSON.parse(response.results)[0]
            }
        }
    }
}

function render_predicted_values() {
    if (predicted_results.length == 0) {
        bars = document.querySelectorAll(".bar_progress");
        bars.forEach(bar => {
            gsap.to(bar, {height: `1%`, duration: 1});
        })

        categories = document.querySelectorAll(".category");
        categories.forEach(category => {
            category.classList.remove("category-active")
        });
    }

    max_predicted_result = Math.max(...predicted_results)
    
    percentage_predicted_result = []
    predicted_results.forEach(value => {
        percentage = (value / max_predicted_result) * 100
        if (percentage < 1) {
            percentage = 1
        }

        percentage_predicted_result.push(percentage);
    })

    bars = document.querySelectorAll(".bar_progress");
    bars.forEach((bar, index) => {
        gsap.to(bar, {height: `${ percentage_predicted_result[index] }%`, duration: 1});
    })

    categories = document.querySelectorAll(".category");
    categories.forEach(category => {
        category.classList.remove("category-active")
    })

    max_predicted_result_index = predicted_results.indexOf(max_predicted_result);
    if(max_predicted_result_index != -1) {
        categories[max_predicted_result_index].classList.add("category-active")
    }
}

setInterval(render_loop, (1000 / frame_rate))