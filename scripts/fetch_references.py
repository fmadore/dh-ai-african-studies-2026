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
        
        # Map keys to metadata we need beyond CSL (tags, DOI, URL)
        metadata_map = {}
        for item in zotero_data:
            key = item.get('key')
            data = item.get('data', {})
            tags = [t.get('tag') for t in data.get('tags', [])]
            doi = data.get('DOI')
            url = data.get('url')
            if key:
                metadata_map[key] = {
                    'tags': tags,
                    'doi': doi,
                    'url': url
                }

        # 3. Merge
        cleaned_data = []
        for item in csl_data:
            # CSL ID format: "GROUPID/KEY" or just "KEY"?
            # In the file we saw: "22500587/QGLHJKL6"
            csl_id = item.get('id', '')
            key = csl_id.split('/')[-1] if '/' in csl_id else csl_id
            
            meta = metadata_map.get(key, {})

            # Inject tags
            item['tags'] = meta.get('tags', [])

            # Inject DOI/URL fallbacks
            doi = meta.get('doi') or item.get('DOI')
            url = meta.get('url') or item.get('URL')

            if doi:
                item['DOI'] = doi
            if url:
                item['URL'] = url
            else:
                # If a DOI exists but URL is missing, build a DOI URL for easier linking later
                if doi:
                    item['URL'] = f"https://doi.org/{doi}"
            
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
