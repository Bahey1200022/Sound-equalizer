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
    amp=np.copy(array[1])
    timesig=np.copy(array[0])
    sigtime=array[0][len(array[0])-2]

    # Perform FFT
    fft_amp = np.fft.fft(amp) # FFT of signal
    freqs = np.fft.fftfreq(len(amp), d=sigtime/len(amp)) # Frequency array
    
    f_index = np.abs(freqs - freqadjusted).argmin() #difference betwween element and freq==0
    
    mag = np.abs(fft_amp[f_index])
    
    new_mag = fft_amp[f_index] * float(mag_change)

    # Apply new magnitude to FFT
    fft_amp[f_index] = new_mag
    
    modified_sig = np.fft.ifft(fft_amp) # Inverse FFT of modified FFT
    print("a7a")
    print(modified_sig[1])
    print(amp[1])
    modified_sig=np.real(modified_sig).tolist()
    modified_signal=modified_sig.tolist()

     
     
    return jsonify({'equalized_sig': modified_signal})




if __name__ == '__main__':
    app.run(debug=True)