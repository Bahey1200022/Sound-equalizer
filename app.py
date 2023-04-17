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
    mag_change=array[2]
    freqadjusted=array[3]
    amp=array[1]
    timesig=array[0]
    sigtime=array[0][len(array[0])-2]

    # Perform FFT
    fft_amp = np.fft.fft(amp) # FFT of signal
    freqs = np.fft.fftfreq(len(amp), d=sigtime/len(amp)) # Frequency array
    
    f_index = np.abs(freqs - freqadjusted).argmin() #difference betwween element and freq==0
    
    mag = np.abs(fft_amp[f_index])
    
    new_mag = mag * mag_change

    # Apply new magnitude to FFT
    fft_amp[f_index] = new_mag
    
    modified_sig = np.fft.ifft(fft_amp) # Inverse FFT of modified FFT



     
     
    return jsonify({'equalized_sig': modified_sig})




if __name__ == '__main__':
    app.run(debug=True)