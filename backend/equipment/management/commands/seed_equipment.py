import os
import urllib.request
from io import BytesIO

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from equipment.models import Category, Equipment

CATEGORIES = [
    {'name': 'Cameras', 'slug': 'cameras', 'description': 'Photo and video cameras for every need'},
    {'name': 'Lenses', 'slug': 'lenses', 'description': 'Wide-angle, telephoto, and prime lenses'},
    {'name': 'Lighting', 'slug': 'lighting', 'description': 'Studio strobes, LED panels, and modifiers'},
    {'name': 'Audio', 'slug': 'audio', 'description': 'Microphones, recorders, and wireless systems'},
    {'name': 'Stabilizers', 'slug': 'stabilizers', 'description': 'Gimbals, tripods, and sliders'},
    {'name': 'Drones', 'slug': 'drones', 'description': 'Aerial photography and video drones'},
]

EQUIPMENT = [
    # Cameras
    {
        'name': 'Sony Alpha A7 IV',
        'description': 'Full-frame mirrorless camera with 33MP BSI-CMOS sensor, 4K 60fps video, '
                       'real-time eye-tracking AF, and 10fps burst shooting. Perfect for portraits, '
                       'weddings, and commercial work.',
        'category_slug': 'cameras',
        'daily_rate': '35000.00',
        'is_available': True,
        'image_url': 'https://images.unsplash.com/photo-1615478648132-6b0bb0dce812?w=800&q=80&fit=crop',
        'image_name': 'sony-a7iv.jpg',
    },
    {
        'name': 'Canon EOS R5',
        'description': '45MP full-frame mirrorless powerhouse with 8K RAW video, 20fps burst, '
                       'IBIS, and Dual Pixel CMOS AF II. Ideal for high-resolution photography and '
                       'cinema-quality video production.',
        'category_slug': 'cameras',
        'daily_rate': '45000.00',
        'is_available': True,
        'image_url': 'https://images.unsplash.com/photo-1622840271762-a68c1dd85d9b?w=800&q=80&fit=crop',
        'image_name': 'canon-r5.jpg',
    },
    {
        'name': 'Blackmagic Pocket Cinema 6K',
        'description': 'Super 35 cinema camera with 6K resolution, 13 stops of dynamic range, '
                       'RAW and BRAW recording, EF lens mount, and built-in ND filters.',
        'category_slug': 'cameras',
        'daily_rate': '52000.00',
        'is_available': True,
        'image_url': 'https://images.unsplash.com/photo-1614885362875-f2aaa94d1db3?w=800&q=80&fit=crop',
        'image_name': 'blackmagic-6k.jpg',
    },
    {
        'name': 'Fujifilm X-T5',
        'description': '40MP APS-C mirrorless camera with film simulations, 6.2K video, '
                       'weather sealing, and compact body. Great for travel and documentary work.',
        'category_slug': 'cameras',
        'daily_rate': '25000.00',
        'is_available': True,
        'image_url': 'https://images.unsplash.com/photo-1566863244489-a5e7946f46f1?w=800&q=80&fit=crop',
        'image_name': 'fujifilm-xt5.jpg',
    },
    {
        'name': 'RED Komodo 6K',
        'description': 'Compact cinema-grade camera with 6K Global Vision sensor, 16+ stops '
                       'dynamic range, Canon RF mount, and professional RAW recording. '
                       'Perfect for narrative and commercial productions.',
        'category_slug': 'cameras',
        'daily_rate': '120000.00',
        'is_available': False,
        'image_url': 'https://images.unsplash.com/photo-1607541557226-23524baeef9e?w=800&q=80&fit=crop',
        'image_name': 'red-komodo.jpg',
    },
    # Lenses
    {
        'name': 'Sony FE 24-70mm f/2.8 GM II',
        'description': 'Professional zoom lens with constant f/2.8 aperture, XD linear motors '
                       'for fast silent AF, and compact lightweight design. Versatile workhorse '
                       'for events, portraits, and commercial shoots.',
        'category_slug': 'lenses',
        'daily_rate': '15000.00',
        'is_available': True,
        'image_url': 'https://images.unsplash.com/photo-1664568650556-1afd02205246?w=800&q=80&fit=crop',
        'image_name': 'sony-24-70.jpg',
    },
    {
        'name': 'Canon RF 50mm f/1.2L USM',
        'description': 'Iconic 50mm prime with exceptionally wide f/1.2 maximum aperture, '
                       'beautiful bokeh, ring USM for near-silent AF, and L-series build quality.',
        'category_slug': 'lenses',
        'daily_rate': '18000.00',
        'is_available': True,
        'image_url': 'https://images.unsplash.com/photo-1649100471314-acfdff1981be?w=800&q=80&fit=crop',
        'image_name': 'canon-50mm.jpg',
    },
    {
        'name': 'Sigma 18-35mm f/1.8 Art',
        'description': 'World\'s first zoom lens with f/1.8 constant aperture in this range. '
                       'Cinema-quality optics, excellent for run-and-gun video and low-light photography.',
        'category_slug': 'lenses',
        'daily_rate': '12000.00',
        'is_available': True,
        'image_url': 'https://images.unsplash.com/photo-1681496160656-b37c9674812a?w=800&q=80&fit=crop',
        'image_name': 'sigma-18-35.jpg',
    },
    {
        'name': 'Sony FE 70-200mm f/2.8 GM OSS II',
        'description': 'Telephoto zoom with Optical SteadyShot, four XD Linear Motors for '
                       'lightning-fast tracking AF, and lightweight carbon-fiber barrel. '
                       'Ideal for sports, wildlife, and events.',
        'category_slug': 'lenses',
        'daily_rate': '20000.00',
        'is_available': True,
        'image_url': 'https://images.unsplash.com/photo-1614292306505-a52af90aff38?w=800&q=80&fit=crop',
        'image_name': 'sony-70-200.jpg',
    },
    # Lighting
    {
        'name': 'Profoto B10 Plus',
        'description': '500Ws battery-powered strobe with HSS support, TTL, 10-stop range, '
                       'built-in radio receiver, and 1/20000s flash duration. '
                       'Studio power in a portable package.',
        'category_slug': 'lighting',
        'daily_rate': '22000.00',
        'is_available': True,
        'image_url': 'https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?w=800&q=80&fit=crop',
        'image_name': 'profoto-b10.jpg',
    },
    {
        'name': 'Aputure 600d Pro',
        'description': '600W daylight LED with Bowens mount, 45,000 lux output, '
                       '5-pin DMX/RDM support, and quiet fan cooling. '
                       'Professional fixture for film and commercial sets.',
        'category_slug': 'lighting',
        'daily_rate': '30000.00',
        'is_available': True,
        'image_url': 'https://images.unsplash.com/photo-1684373166270-d7e779b08d50?w=800&q=80&fit=crop',
        'image_name': 'aputure-600d.jpg',
    },
    {
        'name': 'Godox SL-200W LED Video Light',
        'description': '200W continuous LED panel with 5600K daylight balance, '
                       'Bowens mount compatibility, 0-100% dimming, and quiet fanless design. '
                       'Perfect for interviews and product videos.',
        'category_slug': 'lighting',
        'daily_rate': '14000.00',
        'is_available': True,
        'image_url': 'https://images.unsplash.com/photo-1631407358948-282f69f09a84?w=800&q=80&fit=crop',
        'image_name': 'godox-sl200.jpg',
    },
    {
        'name': '3-Point Lighting Kit (Softboxes)',
        'description': 'Complete 3-point lighting setup: key light 150W, fill light 100W, '
                       'rim light 100W — all with 60x90cm softboxes, stands, and carrying bags. '
                       'Ideal for portraits and interviews.',
        'category_slug': 'lighting',
        'daily_rate': '20000.00',
        'is_available': True,
        'image_url': 'https://images.unsplash.com/photo-1636540661852-5fbbbffd2c2f?w=800&q=80&fit=crop',
        'image_name': 'lighting-kit.jpg',
    },
    # Audio
    {
        'name': 'Rode NTG5 Shotgun Microphone',
        'description': 'Broadcast-quality short shotgun mic with RF-bias technology, '
                       'minimal self-noise (10dBA), weather resistance, and supercardioid pattern. '
                       'Ideal for film, TV, and ENG.',
        'category_slug': 'audio',
        'daily_rate': '9000.00',
        'is_available': True,
        'image_url': 'https://images.unsplash.com/photo-1658715493106-026578f35262?w=800&q=80&fit=crop',
        'image_name': 'rode-ntg5.jpg',
    },
    {
        'name': 'Sony UWP-D21 Wireless Lav Kit',
        'description': 'UHF wireless lavalier system with 30MHz tuning range, '
                       'digital audio processing, multi-channel operation, '
                       'and bodypack transmitter with built-in lav mic.',
        'category_slug': 'audio',
        'daily_rate': '16000.00',
        'is_available': True,
        'image_url': 'https://images.unsplash.com/photo-1684402362932-cf004123ce07?w=800&q=80&fit=crop',
        'image_name': 'sony-uwp.jpg',
    },
    {
        'name': 'Zoom F6 Field Recorder',
        'description': '6-track 32-bit float recorder with timecode, dual AD converters, '
                       'limitless recording, and MixPre compatibility. '
                       'The go-to recorder for single-operator film sound.',
        'category_slug': 'audio',
        'daily_rate': '12000.00',
        'is_available': True,
        'image_url': 'https://images.unsplash.com/photo-1644009938620-2dfffbb93cb9?w=800&q=80&fit=crop',
        'image_name': 'zoom-f6.jpg',
    },
    # Stabilizers
    {
        'name': 'DJI RS 3 Pro Gimbal',
        'description': '3-axis motorized gimbal supporting cameras up to 4.5 kg, '
                       'automated axis locks, built-in OLED screen, LiDAR focus motor, '
                       'and 12-hour battery. Supports Sony/Canon/Nikon native control.',
        'category_slug': 'stabilizers',
        'daily_rate': '18000.00',
        'is_available': True,
        'image_url': 'https://images.unsplash.com/photo-1693496830158-a1881a678a48?w=800&q=80&fit=crop',
        'image_name': 'dji-rs3.jpg',
    },
    {
        'name': 'Manfrotto 504X Fluid Head + 535 Tripod',
        'description': 'Professional fluid head with 15 kg payload, telescopic twin-tube carbon '
                       'tripod, easy link connector, and mid-level spreader. '
                       'Studio-grade stability for video production.',
        'category_slug': 'stabilizers',
        'daily_rate': '10000.00',
        'is_available': True,
        'image_url': 'https://images.unsplash.com/photo-1607835498743-6426f775446a?w=800&q=80&fit=crop',
        'image_name': 'manfrotto-tripod.jpg',
    },
    {
        'name': 'Edelkrone SliderPLUS Pro (Long)',
        'description': 'Motorized 55cm travel / 110cm effective slider with '
                       'CineMag II motors, iOS/Android app control, and time-lapse mode. '
                       'Foldable design for easy transport.',
        'category_slug': 'stabilizers',
        'daily_rate': '25000.00',
        'is_available': True,
        'image_url': 'https://images.unsplash.com/photo-1678655538210-6baab466ce6b?w=800&q=80&fit=crop',
        'image_name': 'edelkrone-slider.jpg',
    },
    # Drones
    {
        'name': 'DJI Mavic 3 Pro',
        'description': 'Three-camera system with Hasselblad main camera, '
                       '4/3 CMOS sensor, 5.1K video, omnidirectional obstacle sensing, '
                       '43-min flight time, and 15km transmission range.',
        'category_slug': 'drones',
        'daily_rate': '55000.00',
        'is_available': True,
        'image_url': 'https://images.unsplash.com/photo-1575568249769-9dd12531ea69?w=800&q=80&fit=crop',
        'image_name': 'dji-mavic3.jpg',
    },
    {
        'name': 'DJI Inspire 3',
        'description': 'Cinema-grade drone with full-frame X9-8K Air camera, '
                       '8K RAW video, dual-operator mode, RTK GPS, and 360° gimbal rotation. '
                       'Professional aerial production platform.',
        'category_slug': 'drones',
        'daily_rate': '160000.00',
        'is_available': True,
        'image_url': 'https://images.unsplash.com/photo-1504881464977-380fd2f91c51?w=800&q=80&fit=crop',
        'image_name': 'dji-inspire3.jpg',
    },
]


def fetch_image(url: str, filename: str, stdout):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as response:
            data = response.read()
        stdout.write(f'    Downloaded {filename} ({len(data) // 1024} KB)')
        return ContentFile(data, name=filename)
    except Exception as exc:
        stdout.write(f'    Could not download {filename}: {exc}')
        return None


class Command(BaseCommand):
    help = 'Seed the database with sample equipment categories and items (prices in KZT)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing equipment and categories before seeding',
        )
        parser.add_argument(
            '--no-images',
            action='store_true',
            help='Skip downloading images',
        )

    def handle(self, *args, **options):
        if options['clear']:
            Equipment.objects.all().delete()
            Category.objects.all().delete()
            self.stdout.write(self.style.WARNING('Cleared existing data.'))

        self.stdout.write('Seeding categories...')
        category_map = {}
        for cat_data in CATEGORIES:
            cat, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults={'name': cat_data['name'], 'description': cat_data['description']},
            )
            category_map[cat_data['slug']] = cat
            self.stdout.write(f'  {"Created" if created else "Exists"}: {cat.name}')

        self.stdout.write('\nSeeding equipment...')
        created_count = 0
        skipped_count = 0

        for item_data in EQUIPMENT:
            category = category_map[item_data['category_slug']]
            equipment, created = Equipment.objects.get_or_create(
                name=item_data['name'],
                defaults={
                    'description': item_data['description'],
                    'category': category,
                    'daily_rate': item_data['daily_rate'],
                    'is_available': item_data['is_available'],
                },
            )

            if created:
                created_count += 1
                self.stdout.write(f'  Created: {item_data["name"]}')

                if not options['no_images'] and item_data.get('image_url'):
                    img_file = fetch_image(
                        item_data['image_url'],
                        item_data['image_name'],
                        self.stdout,
                    )
                    if img_file:
                        equipment.image.save(item_data['image_name'], img_file, save=True)
            else:
                skipped_count += 1
                self.stdout.write(f'  Exists:  {item_data["name"]}')

        self.stdout.write(self.style.SUCCESS(
            f'\nDone. {created_count} items created, {skipped_count} already existed.'
        ))
