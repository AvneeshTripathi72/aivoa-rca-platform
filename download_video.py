import httpx
import re
import os

os.makedirs('uploads', exist_ok=True)
url = 'https://drive.google.com/uc?export=download&id=1av2lzDPx8YMSzTrIz7w51HTRWBz3_5Nj'

with httpx.Client(follow_redirects=True, timeout=120.0) as client:
    r = client.get(url)
    match = re.search(r'action="([^"]+)"', r.text)
    action = match.group(1) if match else 'https://drive.usercontent.google.com/download'
    inputs = dict(re.findall(r'<input type="hidden" name="([^"]+)" value="([^"]*)"', r.text))
    print('Downloading from:', action, inputs)
    
    with client.stream('GET', action, params=inputs) as stream:
        print('Stream status:', stream.status_code, stream.headers.get('content-type'), stream.headers.get('content-length'))
        out_path = 'uploads/demo_video.mp4'
        with open(out_path, 'wb') as f:
            downloaded = 0
            for chunk in stream.iter_bytes(chunk_size=1024*1024):
                f.write(chunk)
                downloaded += len(chunk)
                mb = downloaded / (1024 * 1024)
                if int(mb) % 25 == 0 and int(mb) > 0:
                    print(f'{mb:.1f} MB downloaded...')
    print(f'Download complete! Total size: {downloaded / (1024*1024):.2f} MB')
