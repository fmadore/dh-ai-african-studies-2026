import json
import urllib.request
import os

# Configuration
ZOTERO_GROUP_ID = '6322257'
CSL_URL = f"https://api.zotero.org/groups/{ZOTERO_GROUP_ID}/items?format=csljson&limit=100"
JSON_URL = f"https://api.zotero.org/groups/{ZOTERO_GROUP_ID}/items?format=json&limit=100"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), '../src/lib/data/references.json')

def fetch_url(url):
    print(f"Fetching from {url}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        if response.status != 200:
            raise Exception(f"HTTP {response.status}")
        return json.loads(response.read().decode())

def fetch_references():
    try:
        # 1. Fetch CSL JSON
        csl_data = fetch_url(CSL_URL)
        if isinstance(csl_data, dict):
            csl_data = csl_data.get('items', [])
        
        # 2. Fetch Zotero JSON (for tags)
        zotero_data = fetch_url(JSON_URL)
        
        # Map keys to tags
        tags_map = {}
        for item in zotero_data:
            key = item.get('key')
            data = item.get('data', {})
            tags = [t.get('tag') for t in data.get('tags', [])]
            if key:
                tags_map[key] = tags

        # 3. Merge
        cleaned_data = []
        for item in csl_data:
            # CSL ID format: "GROUPID/KEY" or just "KEY"?
            # In the file we saw: "22500587/QGLHJKL6"
            csl_id = item.get('id', '')
            key = csl_id.split('/')[-1] if '/' in csl_id else csl_id
            
            # Inject tags
            item['tags'] = tags_map.get(key, [])
            
            # Ensure type
            if 'type' not in item:
                item['type'] = 'unknown'
                
            cleaned_data.append(item)

        # Save
        os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(cleaned_data, f, indent=2, ensure_ascii=False)
            
        print(f"Successfully saved {len(cleaned_data)} references with tags to {OUTPUT_FILE}")

    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    fetch_references()
