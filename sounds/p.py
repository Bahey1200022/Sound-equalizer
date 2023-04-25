from moviepy.editor import AudioFileClip

# Load the MP4 file using the AudioFileClip function
clip = AudioFileClip('hi.mp4')

# Set the output file path and the codec (PCM 16-bit, 44100 Hz)
output_path = 'music.wav'
codec = 'pcm_s16le'
fps = clip.fps

# Write the audio data to a WAV file using the write_audiofile method
clip.write_audiofile(output_path, codec=codec, fps=fps)