import numpy as np
import scipy.io.wavfile as wav

# Specify the sampling rate and duration of the audio
sampling_rate = 44100  # Hz
duration = 5  # seconds

# Specify the frequencies and amplitudes of the sinusoidal waves
# freq_ranges=[85,102,146,190,234,278,322,366,410,454]
# amplitudes = [0.9, 0.2, 0.2,0.02,0.002,0.12,0.9,0.8,0.2,0.2]
frequencies = [80,100, 350,300,410,200,250 ]  # Hz
amplitudes = [0.5, 0.5, 0.5, 0.5, 0.7, 0.5, 0.5]

# Generate the audio data
t = np.linspace(0, duration, int(sampling_rate * duration), endpoint=False)
audio_data = np.zeros_like(t)
for freq, amp in zip(frequencies, amplitudes):
    audio_data += amp * np.sin(2 * np.pi * freq * t)

# Scale the audio data to the range [-1, 1]
audio_data /= np.max(np.abs(audio_data))

# Convert the audio data to the appropriate data type for WAV files
audio_data = np.array(audio_data * (2**15 - 1), dtype=np.int16)

# Save the audio data to a WAV file
wav.write('synthetic_file.wav', sampling_rate, audio_data)
