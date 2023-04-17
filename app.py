from flask import Flask, render_template,request, jsonify
import numpy as np
from scipy.fft import fft, rfft
from scipy.fft import fftfreq, rfftfreq

app = Flask(__name__)

@app.route('/')
def equalizer():
    return render_template('main.html')


@app.route('/calculate-equalized_sig', methods=['POST'])
def calculate_equalized():
     array= request.get_json()
     
     
     
     return jsonify({'fftMaxMagnitude': array[3]})




if __name__ == '__main__':
    app.run(debug=True)