-- Himalayan Roots Seed Data
\c h_roots;

-- Categories
INSERT INTO categories (name, slug, description) VALUES
('Rajma & Pulses', 'rajma-pulses', 'Organic mountain-grown legumes from the high Himalayan valleys'),
('Rice & Grains', 'rice-grains', 'Ancient heritage grains cultivated in pristine Himalayan terraces'),
('Fruits', 'fruits', 'Fresh and sun-dried fruits from the orchards of Harshil and Himachal'),
('Dairy & Ghee', 'dairy-ghee', 'Pure, hand-churned ghee from pasture-raised Himalayan cows'),
('Honey', 'honey', 'Wild raw honey harvested from the untouched meadows of the Himalayas')
ON CONFLICT (slug) DO NOTHING;

-- Products
INSERT INTO products (name, slug, short_description, description, price, discount_percentage, stock, unit, category_id, is_featured, origin, weight, tags) VALUES

-- Rajma Chakrata
('Rajma Chakrata', 'rajma-chakrata',
'Heirloom kidney beans from the ancient village of Chakrata, slow-grown at 7,500 ft.',
'Nestled at an altitude of 7,500 feet in the Jaunsar-Bawar region of Uttarakhand, Chakrata is home to one of India''s most prized rajma varieties. Our Rajma Chakrata is cultivated by indigenous farming families using century-old seed-saving traditions. These deep burgundy-red beans are small in size but extraordinarily rich in flavour — earthy, slightly sweet, and buttery soft when cooked. Unlike commercially grown rajma, Chakrata beans are slow-matured through the harsh Himalayan winters, which concentrates their natural proteins and minerals. Each batch is hand-sorted and sun-dried on traditional stone platforms. Rich in plant protein, iron, and complex carbohydrates, these beans form the cornerstone of the famed "Pahadi Rajma Chawal" — a dish that carries the soul of the mountains. Soak overnight, pressure cook with a pinch of asafoetida, and let the Himalayas speak through every bite.',
249.00, 10.00, 150, '500g', 1, TRUE, 'Chakrata, Uttarakhand', '500g', '["organic", "heirloom", "high-altitude", "rajma"]'),

-- Rajma Harshil
('Rajma Harshil', 'rajma-harshil',
'The finest Himalayan rajma from the remote Harshil valley — prized across India.',
'Harshil, a pristine valley cradled by the Bhagirathi river at 11,000 feet near the Gangotri glacier, produces what many consider the finest rajma in the world. Our Rajma Harshil comes from small family farms perched at the edge of the tree line, where the growing season is a brief but intense window between snowmelt and the first autumn frost. These beans are visually striking — speckled in shades of rust, cream, and violet — and have a distinctly silky texture when cooked. The thin skin dissolves effortlessly into curries, releasing a deep, aromatic broth that needs little more than ginger, garlic, and a touch of Himalayan salt to sing. Harshil Rajma has earned GI-tag recognition and commands a premium in Indian markets for its unmatched quality. Hand-harvested, naturally dried, and packed without preservatives, each batch carries the mineral-rich essence of glacial water and mountain soil.',
349.00, 5.00, 80, '500g', 1, TRUE, 'Harshil, Uttarkashi, Uttarakhand', '500g', '["gi-tagged", "premium", "high-altitude", "organic"]'),

-- Rajma Osla
('Rajma Osla', 'rajma-osla',
'Sacred valley beans from Osla — a village at the foot of the Swargarohini peak.',
'Osla is a remote village in the Tons valley of Uttarkashi, accessible only by treacherous mountain trails, lying in the shadow of the mythical Swargarohini ("Stairway to Heaven") peak. Here, at over 8,000 feet, a small community of Har-ki-Doon valley farmers have preserved a unique rajma variety for generations. Rajma Osla is medium-sized with a deep maroon hue and a distinctive earthy-nutty aroma that intensifies with cooking. What makes Osla beans exceptional is the ultra-cold, dry mountain air during harvest season — which naturally dehydrates the beans slowly without enzymatic degradation, preserving their complete nutritional profile. The resulting beans are denser in nutrients, higher in dietary fibre, and have a lower glycemic index than plains-grown alternatives. Limited to a small annual harvest, this is a truly rare find — each packet represents the labor of families who have farmed this sacred valley for centuries.',
299.00, 0.00, 60, '500g', 1, FALSE, 'Osla, Tons Valley, Uttarakhand', '500g', '["rare", "high-altitude", "traditional", "organic"]'),

-- Red Rice
('Red Rice (Lal Chawal)', 'red-rice-lal-chawal',
'Ancient Himalayan red rice from high-altitude terraces — nutty, nutritious, and unpolished.',
'Red Rice — known locally as "Lal Chawal" — is one of the most ancient grain varieties cultivated in the Himalayan region, predating modern agriculture by millennia. Our Red Rice comes from terraced paddies carved into steep mountain slopes between 5,000–7,000 feet, where glacial meltwater irrigates the fields naturally. This unpolished, whole-grain rice retains its red bran layer, which is packed with anthocyanins (the antioxidants that give it its deep crimson color), zinc, iron, and magnesium. The grain is shorter and sturdier than white rice, with a satisfying chewiness and a nutty, slightly earthy flavour that pairs beautifully with curries, dals, and stir-fries. Red Rice is a staple in Himalayan households, revered for its high fibre content and slow energy release — making it ideal for diabetics and health-conscious individuals. Sun-dried on terraces and stored in traditional wooden granaries, our Lal Chawal arrives at your table exactly as nature intended.',
199.00, 0.00, 200, '1kg', 2, TRUE, 'Garhwal Himalayas, Uttarakhand', '1kg', '["ancient-grain", "unpolished", "antioxidant", "wholegrain"]'),

-- Bhatt ki Daal
('Bhatt ki Daal', 'bhatt-ki-daal',
'The black soybean of the Himalayas — a Pahadi superfood revered for centuries.',
'Bhatt ki Daal is Uttarakhand''s own black soybean — a legume so deeply woven into Pahadi culture that it appears in weddings, festivals, and daily meals alike. Known botanically as Glycine max, but cultivated in the Himalayas for over 3,000 years, Bhatt is smaller and darker than commercial soybeans, with a concentrated flavour profile that is simultaneously robust and deeply comforting. Our Bhatt ki Daal is sourced from organic farms in the Kumaon and Garhwal hills, where it grows alongside wheat and barley in traditional polyculture systems. Rich in complete plant protein (over 36g per 100g), B vitamins, calcium, and omega fatty acids, it is a true nutritional powerhouse that has sustained mountain communities through the harshest winters. The traditional Pahadi preparation — bhatte ki churkani (a spiced black soybean curry) — is a dish of extraordinary depth, with a smoky, slightly bitter character that is utterly unique to the mountains. Not to be missed.',
179.00, 15.00, 120, '500g', 1, TRUE, 'Kumaon & Garhwal, Uttarakhand', '500g', '["superfood", "protein-rich", "traditional", "pahadi"]'),

-- Apple Harshil
('Apple Harshil', 'apple-harshil',
'Sun-kissed apples from the legendary Harshil valley — naturally crisp and intensely fragrant.',
'The apple orchards of Harshil are a well-kept secret of the Garhwal Himalayas. At nearly 11,000 feet, where the air is thin and the sun is fierce, apple trees produce fruit of extraordinary quality — smaller than commercial apples, but with a sweetness-to-acidity balance and fragrance that no plains-grown variety can match. Our Harshil Apples are harvested by hand in the brief September-October window before the valley closes for winter. The extreme diurnal temperature variation (warm days, freezing nights) forces the trees to concentrate sugars and aromatic compounds in the fruit, resulting in a deep, complex flavour — floral, honey-like, with a crisp snap and minimal water content. These apples are not waxed, not cold-stored in chemical atmospheres, and never treated with pesticides. What you receive is the pure, unadulterated product of altitude, glacial water, and mountain sunshine. Available fresh in season and as sun-dried slices year-round.',
399.00, 0.00, 50, 'kg', 3, TRUE, 'Harshil, Uttarkashi, Uttarakhand', '1kg', '["fresh", "organic", "high-altitude", "seasonal"]'),

-- Apple Himachal
('Apple Himachal', 'apple-himachal',
'Premium Himachali apples from the Kullu-Manali belt — sweet, crisp, and chemical-free.',
'Himachal Pradesh is synonymous with apples in India, and for good reason. The Kullu-Manali belt, Shimla hills, and Kinnaur valleys produce apples that have defined Indian fruit culture for generations. Our Himachali Apples are sourced exclusively from small, family-owned orchards that follow integrated pest management and organic practices — no synthetic pesticides, no ethylene gas for artificial ripening. Grown at altitudes between 6,000–9,000 feet, these apples benefit from the dramatic seasonal rhythms of the western Himalayas: monsoon rains, bright post-monsoon sunshine, and cold pre-harvest nights. The result is a fruit with exceptional shelf life, firm flesh, vibrant colour, and a refreshing sweet-tart flavour profile. Rich in dietary fibre, Vitamin C, and quercetin (a powerful anti-inflammatory antioxidant), these apples are as nourishing as they are delicious. Directly linked to farmer cooperatives, every purchase supports Himalayan farming families.',
279.00, 10.00, 100, 'kg', 3, FALSE, 'Kullu-Manali, Himachal Pradesh', '1kg', '["fresh", "premium", "cooperative-sourced", "organic"]'),

-- Ghee
('Pure Himalayan Ghee', 'pure-himalayan-ghee',
'Hand-churned, bilona-method ghee from indigenous Pahadi cow''s milk — liquid gold from the mountains.',
'In Himalayan tradition, ghee is not merely a cooking medium — it is medicine, ritual, and sustenance combined. Our Pure Himalayan Ghee is made using the ancient bilona churning method: fresh whole milk from indigenous Pahadi cows (a hardy, smaller breed adapted to high altitudes) is first cultured into curd, then hand-churned with a wooden beater to extract white butter, which is then slowly clarified over a wood fire until it transforms into pure, golden ghee. This traditional process preserves naturally occurring Conjugated Linoleic Acid (CLA), fat-soluble vitamins A, D, E, and K2, and butyric acid — compounds largely absent in commercially produced ghee that uses cream-based shortcuts. The result is a ghee with a rich, nutty aroma, a golden-amber colour, and a flavour so distinctive that a single spoonful elevates any dish. Ayurvedic texts prescribe bilona ghee for digestive health, immunity, and cognitive clarity. Our cows graze on wild Himalayan grasses and herbs, making this ghee not just food, but a living link to the mountain ecosystem.',
899.00, 5.00, 40, '500ml', 4, TRUE, 'Garhwal Himalayas, Uttarakhand', '500ml', '["bilona-method", "a2-ghee", "grass-fed", "ayurvedic"]'),

-- Honey
('Wild Himalayan Honey', 'wild-himalayan-honey',
'Raw, unfiltered mountain honey harvested from wild Himalayan bee colonies in alpine meadows.',
'Himalayan wild honey is unlike anything produced in managed apiaries. Our honey comes from free-ranging Apis cerana (Indian hill bee) colonies that forage across alpine meadows above 8,000 feet — meadows carpeted with rhododendron, buckwheat, wild thyme, clover, and countless medicinal mountain herbs. The result is a dark, complex, intensely aromatic honey that tastes of wildflowers and mountain air. Because it is raw and unfiltered, our honey retains all its naturally occurring enzymes, pollen, propolis, and beeswax traces — the full spectrum of beneficial compounds that heating and industrial filtering destroy. Rich in antioxidants, antimicrobial compounds, and natural enzymes, raw Himalayan honey has been used in Ayurvedic medicine for millennia to treat respiratory conditions, aid digestion, and boost immunity. It granulates naturally (a sign of purity) and can be gently warmed to restore its liquid consistency. Each jar carries the unique floral signature of the season and altitude of harvest — a product that is truly irreplaceable.',
599.00, 0.00, 70, '500g', 5, TRUE, 'Uttarakhand High Himalayas', '500g', '["raw", "unfiltered", "wild-harvest", "medicinal"]')

ON CONFLICT (slug) DO NOTHING;

-- Default admin user (password: Admin@123)
-- Admin password: Admin@123
INSERT INTO admin_users (name, email, password_hash, role) VALUES
('Admin', 'admin@himalayanroots.com', '$2a$12$1xLcu85a//f0EO6nSD.CB.UxYXskGnhtN9nFqIk9xAi7R.nfCgQy.', 'superadmin')
ON CONFLICT (email) DO UPDATE SET password_hash = '$2a$12$1xLcu85a//f0EO6nSD.CB.UxYXskGnhtN9nFqIk9xAi7R.nfCgQy.';

-- Site settings
INSERT INTO site_settings (key, value) VALUES
('site_name', 'Himalayan Roots'),
('tagline', 'From the Mountains, For the World'),
('free_shipping_above', '999'),
('contact_email', 'hello@himalayanroots.com'),
('contact_phone', '+91 98765 43210'),
('instagram_url', 'https://instagram.com/himalayanroots'),
('facebook_url', 'https://facebook.com/himalayanroots'),
('whatsapp_number', '919910426826'),
('whatsapp_message', 'Hello! I have a question about Himalayan Roots products.'),
('shipping_charge', '99'),
('min_order_amount', '0')
ON CONFLICT (key) DO NOTHING;
