import pathlib
import re

path = pathlib.Path('init/data.js')
text = path.read_text(encoding='utf-8')
coords = {
    'Malibu': [-118.7798, 34.0259],
    'New York City': [-74.0060, 40.7128],
    'Aspen': [-106.8244, 39.1911],
    'Florence': [11.2558, 43.7696],
    'Portland': [-122.6765, 45.5231],
    'Cancun': [-86.8515, 21.1619],
    'Lake Tahoe': [-120.0434, 39.0968],
    'Los Angeles': [-118.2437, 34.0522],
    'Verbier': [7.2244, 46.0955],
    'Serengeti National Park': [34.6857, -2.3333],
    'Amsterdam': [4.9041, 52.3676],
    'Fiji': [178.0650, -17.7134],
    'Cotswolds': [-1.8590, 51.8295],
    'Boston': [-71.0589, 42.3601],
    'Bali': [115.1889, -8.4095],
    'Banff': [-115.5728, 51.1784],
    'Miami': [-80.1918, 25.7617],
    'Phuket': [98.3744, 7.9519],
    'Scottish Highlands': [-4.2260, 57.4910],
    'Dubai': [55.2708, 25.2048],
    'Montana': [-110.3626, 46.8797],
    'Mykonos': [25.3315, 37.4467],
    'Costa Rica': [-84.0907, 9.7489],
    'Charleston': [-79.9311, 32.7765],
    'Tokyo': [139.6917, 35.6895],
    'New Hampshire': [-71.5724, 43.1939],
    'Maldives': [73.2207, 3.2028],
}

pattern = re.compile(r'(?P<indent>\s*)location:\s*"(?P<loc>[^"]+)"\s*,\s*\n\s*country:\s*"(?P<country>[^"]+)"\s*,', re.M)

def replacement(match):
    loc = match.group('loc')
    country = match.group('country')
    key = loc if loc in coords else country if country in coords else None
    if key is None:
        raise ValueError(f'No coordinates defined for location/country: {loc} / {country}')
    lon, lat = coords[key]
    indent = match.group('indent')
    return (
        f'{indent}location: "{loc}",\n'
        f'{indent}country: "{country}",\n'
        f'{indent}geometry: {{\n'
        f'{indent}  type: "Point",\n'
        f'{indent}  coordinates: [{lon}, {lat}]\n'
        f'{indent}}},'
    )

new_text, count = pattern.subn(replacement, text)
if count == 0:
    raise SystemExit('No listing entries were modified. Pattern may not match file format.')
path.write_text(new_text, encoding='utf-8')
print(f'Inserted geometry into {count} listing entries.')
