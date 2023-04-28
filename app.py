from flask import Flask, render_template,request, jsonify, send_file
import numpy as np
import os
import scipy.signal as signal
import matplotlib.pyplot as plt
from scipy.signal import butter, filtfilt

from scipy.fft import fft, rfft
from scipy.fft import fftfreq, rfftfreq
import wave
app = Flask(__name__)
######################################################################################################################
######################################################################################################################################################
#####################################################################
##### PROCESSING
def bandpass_filter(amp, sr,mag,lowr,highr):
    # Define the frequency range of the guitar sounds (82 Hz - 1046 Hz)
    low = lowr / (sr / 2)
    high = highr / (sr / 2)

    # Apply a Butterworth bandpass filter to the signal
    b, a = signal.butter(4, [low, high], btype='bandpass' )
    filtered_signal = mag*10* signal.filtfilt(b, a, amp) 

    return filtered_signal



def musicfft(amplist,time,equalizedmag,f1,f2):
    fft_amp = np.fft.fft(amplist) # FFT of signal
    freqs = np.fft.fftfreq(len(amplist), d=time/len(amplist)) # Frequency array
    freq_mask = (freqs >= f1) & (freqs <= f2)
    #freqs_picked = freqs[freq_mask]
    new_mag = fft_amp[freq_mask] * 10*float(equalizedmag)
    fft_amp[freq_mask] = new_mag
    modified_sig = np.fft.ifft(fft_amp) # Inverse FFT of modified FFT
    modified_sig=np.real(modified_sig)
    # modified_signal=modified_sig.tolist()
    return modified_sig
    

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

def equalize_vowel(amplist,time,equalizedmag,range11,range12,range21,range22):
    fft_amp = np.fft.fft(amplist) # FFT of signal
    freqs = np.fft.fftfreq(len(amplist), d=time/len(amplist)) # Frequency array
    freq_mask = (freqs >= range11) & (freqs <= range12)
    mask2 = (freqs >= range21) & (freqs <= range22)
    new_mag = fft_amp[freq_mask & mask2] * float(equalizedmag)
    fft_amp[freq_mask & mask2] = new_mag
    modified_sig = np.fft.ifft(fft_amp) # Inverse FFT of modified FFT
    modified_sig=np.real(modified_sig)
    print("tamam ?")
    return modified_sig
    


    
################################################################################################################################
#################################################################################################################
@app.route('/')
def equalizer():
    return render_template('main.html')



        
@app.route('/send_signal', methods=['POST'])
def get_signal():
    global originatime 
    global originalamp
    array= request.get_json()
    # global originatime 
    originatime=array[0]
    # global originalamp
    originalamp=array[1]
    
    file_path = "spectrogram.png"
    if os.path.exists(file_path):
        os.remove("spectrogram.png")
    file_path2 = "spectrogram2.png"
    if os.path.exists(file_path2):
        os.remove(file_path2)        
   
    return jsonify({'sig': originalamp})


    

        
        
        

@app.route('/calculate-equalized_sig', methods=['POST'])
def calculate_equalized():
    array= request.get_json()
    mag_change=np.copy(array[2])
    freqadjusted=np.copy(array[3])
    amp=np.copy(array[1])
    sigtime=array[0][len(array[0])-2]
    
    for i in range(len(freqadjusted)):
        amp=equalize_freq(amp,sigtime,freqadjusted[i],mag_change[i])
        
    modified_signal=amp.tolist()
    global amplitudelist
    amplitudelist = modified_signal.copy()
    
     
    return jsonify({'equalized_sig': modified_signal})
############################################################################################################################
###################################################################################################3
@app.route('/music', methods=['POST'])
def music():
    array= request.get_json()
    mag_change=np.copy(array[0])
    oamp=np.copy(originalamp)
    amp=oamp
    if (mag_change[0]!=1):#bass
        amp=musicfft(oamp,originatime[len(originatime)-2],10*mag_change[0],40,246)
        amp=musicfft(oamp,originatime[len(originatime)-2],-10*mag_change[0],246,1586)

    
        
    if (mag_change[1] !=1):#violin
        amp=musicfft(oamp,originatime[len(originatime)-2],mag_change[0],246,1586)
        amp=musicfft(oamp,originatime[len(originatime)-2],mag_change[0],40,246)


        
    modified_signal=amp.tolist()
    
    global amplitudelist
    amplitudelist = modified_signal.copy()    
        
    return jsonify({'equalized_sig': modified_signal})
###################################################################################################################################################
##################################################################################################################################
@app.route('/vowels', methods=['POST'])
def vowels():
    array= request.get_json()
    mag_change=np.copy(array[0])
    oamp=np.copy(originalamp)
    amp=oamp
    if (mag_change[0]!=1):# o
        amp=bandpass_filter(oamp,4800,mag_change[0],350,700)
    if (mag_change[1]!=1):#330-3300  A
        amp=equalize_vowel(oamp,originatime[len(originatime)-2],mag_change[1],600,1000,1000,3000)
    if (mag_change[2]!=1): #i
        amp=bandpass_filter(oamp,4800,mag_change[0],1000,7000)

    
        
 

    modified_signal=amp.tolist()
    global amplitudelist
    amplitudelist = modified_signal.copy()
    return jsonify({'equalized_sig': modified_signal})

###################################################################################################################################################
##################################################################################################################################
@app.route('/medical', methods=['POST'])
def medical():
    array= request.get_json()
    mag_change=np.copy(array[0])
    oamp=np.copy(originalamp)
    amp=oamp
    #
    if (mag_change[0]!=1 and mag_change[0]!=0 ):
        amp=bandpass_filter(oamp,4800,mag_change[0],20,80)
    elif (mag_change[0]==0):
        amp=musicfft(oamp,originatime[len(originatime)-2],1,81,150)    
    #
    modified_signal=amp.tolist()
    global amplitudelist
    amplitudelist = modified_signal.copy()
    return jsonify({'equalized_sig': modified_signal})
    

    
##################################################################################################################################
##################################################################################################################################
##################################################################################################################################
##################################################################################################################################
#   spectogram and audio convergence

@app.route('/generate_audio')
def generate_audio():
    
    file_path = "audio_file.wav"
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
        wav_file.setframerate(48000)
        wav_file.writeframes(equalizedamp)

    # Return the WAV file as a binary response
    return send_file(wav_filename, mimetype='audio/wav', as_attachment=True)




@app.route('/specto2')
def get_result():
    file_path2 = "spectrogram2.png"
    if os.path.exists(file_path2):
        os.remove(file_path2)
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
    # plt.colorbar()
    plt.savefig('spectrogram2.png')
    filename2='spectrogram2.png'
    return send_file(filename2, mimetype='image/png')    
    
        





@app.route('/spectogram')
def get_image():
    file_path = "spectrogram.png"
    if os.path.exists(file_path):
        os.remove("spectrogram.png")
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
    # plt.colorbar()

    # Save the plot as an image
    plt.savefig('spectrogram.png')
    filename='spectrogram.png'
    return send_file(filename, mimetype='image/png')




    
        
    
    
if __name__ == '__main__':
    app.run(debug=True)