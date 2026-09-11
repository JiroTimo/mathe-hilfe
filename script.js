const canvas = document.getElementById("graph");
const functionInput = document.getElementById("function-input");
const slider = document.getElementById("x-slider");
const xValue = document.getElementById("x-value");
const message = document.getElementById("message");

if (canvas && functionInput && slider) {
    const context = canvas.getContext("2d");
    const xMin = -10;
    const xMax = 10;
    const yMin = -10;
    const yMax = 10;

    function toCanvasX(x) {
        return ((x - xMin) / (xMax - xMin)) * canvas.width;
    }

    function toCanvasY(y) {
        return canvas.height - ((y - yMin) / (yMax - yMin)) * canvas.height;
    }

    function parseFunction(expression) {
        let parsed = expression.toLowerCase().replace(/\s+/g, "").replace(/\^/g, "**");
        parsed = parsed.replace(/\bpi\b/g, "Math.PI").replace(/\be\b/g, "Math.E");
        parsed = parsed.replace(/\b(sin|cos|tan|sqrt|abs|log|ln)\b/g, "Math.$1");
        parsed = parsed.replace(/Math\.ln/g, "Math.log");
        parsed = parsed.replace(/(\d|\))x/g, "$1*x").replace(/x(\d|\()/g, "x*$1");

        if (!/^[0-9x+\-*/%().,a-zA-Z*]+$/.test(parsed) ||
            /(?:Math\.){2}|(?:^|[^a-zA-Z])(?:constructor|window|document|eval)(?:[^a-zA-Z]|$)/.test(parsed)) {
            throw new Error("Ungültige Funktion");
        }

        const calculate = new Function("x", `"use strict"; return (${parsed});`);
        return (x) => {
            const result = Number(calculate(x));
            return Number.isFinite(result) ? result : null;
        };
    }

    function drawAxes() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.strokeStyle = "#dec9df";
        context.lineWidth = 1;

        for (let value = xMin; value <= xMax; value += 1) {
            const x = toCanvasX(value);
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, canvas.height);
            context.stroke();
        }
        for (let value = yMin; value <= yMax; value += 1) {
            const y = toCanvasY(value);
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(canvas.width, y);
            context.stroke();
        }

        context.strokeStyle = "#333";
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(toCanvasX(0), 0);
        context.lineTo(toCanvasX(0), canvas.height);
        context.moveTo(0, toCanvasY(0));
        context.lineTo(canvas.width, toCanvasY(0));
        context.stroke();

        context.fillStyle = "#333";
        context.font = "14px sans-serif";
        context.fillText("x", canvas.width - 18, toCanvasY(0) - 8);
        context.fillText("y", toCanvasX(0) + 8, 16);
    }

    function drawGraph() {
        drawAxes();
        try {
            const calculate = parseFunction(functionInput.value);
            context.strokeStyle = "#7b4c9e";
            context.lineWidth = 3;
            context.beginPath();
            let drawing = false;

            for (let pixel = 0; pixel <= canvas.width; pixel += 1) {
                const x = xMin + (pixel / canvas.width) * (xMax - xMin);
                const y = calculate(x);
                if (y === null || Math.abs(y) > 1000) {
                    drawing = false;
                    continue;
                }
                const canvasY = toCanvasY(y);
                if (!drawing) {
                    context.moveTo(pixel, canvasY);
                    drawing = true;
                } else {
                    context.lineTo(pixel, canvasY);
                }
            }
            context.stroke();

            const selectedX = Number(slider.value);
            const selectedY = calculate(selectedX);
            xValue.value = selectedX.toFixed(2);
            if (selectedY === null) {
                message.textContent = "Für diesen x-Wert ist die Funktion nicht definiert.";
                return;
            }
            message.textContent = `f(${selectedX.toFixed(2)}) = ${selectedY.toFixed(2)}`;
            if (selectedY >= yMin && selectedY <= yMax) {
                context.fillStyle = "#d34f73";
                context.beginPath();
                context.arc(toCanvasX(selectedX), toCanvasY(selectedY), 6, 0, 2 * Math.PI);
                context.fill();
            }
        } catch (error) {
            message.textContent = "Bitte gib eine gültige Funktion ein, z. B. x^2, sin(x) oder 2*x+1.";
        }
    }

    functionInput.addEventListener("input", drawGraph);
    slider.addEventListener("input", drawGraph);
    drawGraph();
}