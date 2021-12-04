from flask import Flask, render_template

app = Flask(
    __name__,
    template_folder = "static"    
)

@app.route('/')
def interface():
    return render_template("interface.html")

if __name__ == "__main__":
    app.run(debug = True)