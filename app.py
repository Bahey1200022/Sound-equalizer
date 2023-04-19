from flask import Flask, render_template,request, jsonify, send_file
import numpy as np
from scipy.fft import fft, rfft
from scipy.fft import fftfreq, rfftfreq
import wave
app = Flask(__name__)

@app.route('/')
def equalizer():
    return render_template('main.html')

timelist=[]

def equalize_freq(freq_list):
    for i in freq_list:
        

@app.route('/calculate-equalized_sig', methods=['POST'])
def calculate_equalized():
    array= request.get_json()
    mag_change=array[2]
    freqadjusted=array[3]
    amp=np.copy(array[1])
    timelist=array[0].copy()
    # timesig=np.copy(array[0])
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
    
    modified_sig=np.real(modified_sig)
    modified_signal=modified_sig.tolist()
    global amplitudelist
    amplitudelist = modified_signal.copy()
     
     
    return jsonify({'equalized_sig': modified_signal})


@app.route('/generate_audio')
def generate_audio():
    # Define the time and amplitude arrays
    print(f'fady {amplitudelist}')
    amplitudelist_scaled = np.int16(amplitudelist / np.max(np.abs(amplitudelist)) * 32767) #Values are scaled to be audiable (The range is between -32768 to 32767)
    equalizedamp = np.array(amplitudelist_scaled)

    # Save the arrays as a WAV file
    wav_filename = 'audio_file.wav'
    with wave.open(wav_filename, 'wb') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(44100)
        wav_file.writeframes(equalizedamp)

    # Return the WAV file as a binary response
    return send_file(wav_filename, mimetype='audio/wav', as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)