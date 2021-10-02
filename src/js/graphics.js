/**
 * graphics.js
 * Functions for rendering of tuning graphics
 */


// draws a graphic of the scale represented as notches on a horizontal rule
function render_graphic_scale_rule()
{
    let canvas = document.getElementById("graphic-scale-rule")
    let w = canvas.width
    let h = canvas.height
    let ctx = canvas.getContext("2d")

    // render background
    ctx.fillStyle = "#fff"
    ctx.fillRect(0,0,w,h)

    // render a plain horizontal rule
    ctx.beginPath()
    ctx.moveTo(0,h*0.5)
    ctx.lineTo(w,h*0.5)
    ctx.strokeStyle = "#555"
    ctx.lineWidth = 3
    ctx.stroke()

    // if scale data exists then add some notches to the rule
    if (tuning_table.note_count > 0)
    {
        let equave = tuning_table.tuning_data[tuning_table.note_count-1]
        for (i=0; i<tuning_table.note_count; i++) {
            let pos = 1 + ((w-2) * (Math.log(tuning_table.tuning_data[i]) / Math.log(equave)))
            console.log(pos)
            ctx.beginPath()
            ctx.moveTo(pos,h*0.4)
            ctx.lineTo(pos,h*0.6)
            ctx.strokeStyle = "#555"
            ctx.lineWidth = 3
            ctx.stroke()
        }
    }
}

// init graphics
render_graphic_scale_rule()