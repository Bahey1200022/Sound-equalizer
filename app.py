from flask import Flask, render_template,request, jsonify, send_file,session
import numpy as np
import os
import scipy.signal as signal
import matplotlib.pyplot as plt
from scipy.fft import fft, rfft
from scipy.fft import fftfreq, rfftfreq
import wave
app = Flask(__name__)
app.secret_key = 'your_secret_key'


@app.route('/')
def equalizer():
    return render_template('main.html')


def equalize_freq(amplist,time,f,equalizedmag):
        fft_amp = np.fft.fft(amplist) # FFT of signal
        freqs = np.fft.fftfreq(len(amplist), d=time/len(amplist)) # Frequency array
        freq_mask = (freqs >= f-44) & (freqs <= f)
        #freqs_picked = freqs[freq_mask]
        new_mag = fft_amp[freq_mask] * float(equalizedmag)
        fft_amp[freq_mask] = new_mag
        modified_sig = np.fft.ifft(fft_amp) # Inverse FFT of modified FFT
        modified_sig=np.real(modified_sig)
        # modified_signal=modified_sig.tolist()
        return modified_sig

        
@app.route('/send_signal', methods=['POST'])
def get_signal():
    array= request.get_json()
    global originatime 
    originatime=array[0]
    global originalamp
    originalamp=array[1]
    return jsonify({'sig': originalamp})


    

        
        
        

@app.route('/calculate-equalized_sig', methods=['POST'])
def calculate_equalized():
    array= request.get_json()
    mag_change=np.copy(array[2])
    freqadjusted=np.copy(array[3])
    amp=np.copy(array[1])
    sigtime=array[0][len(array[0])-2]
    #timelist=array[0].copy()
    # timesig=np.copy(array[0])
    # Perform FFT
    # fft_amp = np.fft.fft(amp) # FFT of signal
    # freqs = np.fft.fftfreq(len(amp), d=sigtime/len(amp)) # Frequency array
    
    # f_index = np.abs(freqs - freqadjusted).argmin() #difference betwween element and freq==0
    
    # mag = np.abs(fft_amp[f_index])
    
    # new_mag = fft_amp[f_index] * float(mag_change)

    # # Apply new magnitude to FFT
    # fft_amp[f_index] = new_mag
    
    # modified_sig = np.fft.ifft(fft_amp) # Inverse FFT of modified FFT
    
    # modified_sig=np.real(modified_sig)
    # modified_signal=modified_sig.tolist()
    
    for i in range(len(freqadjusted)):
        amp=equalize_freq(amp,sigtime,freqadjusted[i],mag_change[i])
        
        
        
    modified_signal=amp.tolist()
    
    global amplitudelist
    amplitudelist = modified_signal.copy()
    
     
    return jsonify({'equalized_sig': modified_signal})




@app.route('/generate_audio')
def generate_audio():
    
    file_path = "spectrogram.png"
    if os.path.exists(file_path):
        os.remove(file_path)
   
    
    amplitudelist_scaled = np.int16(amplitudelist / np.max(np.abs(amplitudelist)) * 32767) #Values are scaled to be audiable (The range is between -32768 to 32767)
    equalizedamp = np.array(amplitudelist_scaled)

    # Save the arrays as a WAV file
    wav_filename = 'audio_file.wav'
    # wav_filename=wav_filename.format(session['counter'])
    with wave.open(wav_filename, 'wb') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(44100)
        wav_file.writeframes(equalizedamp)

    # Return the WAV file as a binary response
    return send_file(wav_filename, mimetype='audio/wav', as_attachment=True)




@app.route('/spectogram2')
def get_result():
    file_path = "spectrogram2.png"
    if os.path.exists(file_path):
        os.remove(file_path)
    otime=np.copy(originatime)
    oamp=np.copy(amplitudelist)
    window = signal.windows.hann(1024)
    noverlap = 512
    # Generate a spectrogram using the signal
    freq, time, Sxx = signal.spectrogram(oamp, fs=1.0/(otime[1]-otime[0]),
                                        window=window, noverlap=noverlap)
    plt.pcolormesh(time, freq, 10*np.log10(Sxx), cmap='viridis')
    plt.xlabel('Time [s]')
    plt.ylabel('Frequency [Hz]')
    plt.colorbar()
    plt.savefig('spectrogram2.png')
    filename='spectrogram2.png'
    return send_file(filename, mimetype='image/png')    
    
        





@app.route('/spectogram')
def get_image():
    file_path = "spectrogram.png"
    if os.path.exists(file_path):
        os.remove(file_path)
    oamp=np.copy(originalamp)
    otime=np.copy(originatime)
    window = signal.windows.hann(1024)
    noverlap = 512
    # Generate a spectrogram using the signal
    freq, time, Sxx = signal.spectrogram(oamp, fs=1.0/(otime[1]-otime[0]),
                                        window=window, noverlap=noverlap)
    plt.pcolormesh(time, freq, 10*np.log10(Sxx), cmap='viridis')
    plt.xlabel('Time [s]')
    plt.ylabel('Frequency [Hz]')
    plt.colorbar()

    # Save the plot as an image
    plt.savefig('spectrogram.png')
    filename='spectrogram.png'
    return send_file(filename, mimetype='image/png')




if __name__ == '__main__':
    app.run(debug=True)