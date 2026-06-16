export const products = [
  {
    id: "saree-01",
    name: "Meera Lavender Organza Saree",
    category: "sarees",
    price: 3999,
    salePrice: 1999,
    discount: 50,
    rating: 4.8,
    isNew: true,
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80"
    ],
    sizes: ["Free Size"],
    colors: ["Lavender Purple", "Soft Rose Gold", "Pastel Lilac"],
    description: "Crafted with love and elegance, the Meera Organza Saree features delicate silver zari floral borders and a lightweight translucent drape. Perfect for festive celebrations, weddings, and premium family gatherings.",
    details: [
      "Fabric: Premium Organza Silk",
      "Work: Embroidered Silver Zari Border",
      "Length: 5.5 meters saree + 0.8 meters blouse piece",
      "Care: Dry clean only"
    ],
    reviews: [
      { id: 1, userName: "Zara Khan", rating: 5, date: "2026-05-12", text: "Absolutely stunning saree! The lavender color is so premium and the organza fabric is incredibly light and easy to drape." },
      { id: 2, userName: "Priya S.", rating: 4, date: "2026-05-28", text: "Received so many compliments at my cousin's wedding. The zari work is detailed and very clean." }
    ]
  },
  {
    id: "saree-02",
    name: "Zoya Silk Banarasi Saree",
    category: "sarees",
    price: 5999,
    salePrice: 3599,
    discount: 40,
    rating: 4.9,
    isNew: false,
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
    ],
    sizes: ["Free Size"],
    colors: ["Magenta Wine", "Deep Charcoal Gold"],
    description: "An absolute masterpiece of traditional weaving, the Zoya Banarasi Saree is woven with fine silk threads and intricate golden brocade motifs. A royal touch for the modern bride.",
    details: [
      "Fabric: Katan Silk",
      "Weave: Banarasi Brocade",
      "Accents: Heavy Pallu with tassels",
      "Care: Dry clean recommended"
    ],
    reviews: [
      { id: 1, userName: "Aisha M.", rating: 5, date: "2026-04-18", text: "Pure luxury. The weight of the silk is amazing and the golden zari has a beautiful premium glow." }
    ]
  },
  {
    id: "kurti-01",
    name: "Aria Floral Anarkali Kurti",
    category: "kurtis",
    price: 2499,
    salePrice: 1249,
    discount: 50,
    rating: 4.7,
    isNew: true,
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1608930261073-455b55021571?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Ivory Lavender", "Dusty Pink", "Powder Blue"],
    description: "Flowy, elegant, and timeless. The Aria Anarkali features hand-painted floral motifs on dynamic premium georgette fabric, featuring a pleated bodice and round neck.",
    details: [
      "Fabric: Faux Georgette with inner crepe lining",
      "Style: Floor-length Anarkali flared fit",
      "Sleeve: Full length sheer sleeves",
      "Closure: Concealed back zipper"
    ],
    reviews: [
      { id: 1, userName: "Saba F.", rating: 5, date: "2026-05-30", text: "Super comfortable and fits like a dream. The flare is beautiful and looks extremely high-end!" },
      { id: 2, userName: "Meera Nair", rating: 4, date: "2026-06-02", text: "Fabric quality is good. It is slightly long for my height, but with heels it is perfect." }
    ]
  },
  {
    id: "kurti-02",
    name: "Lilac Georgette A-Line Kurti",
    category: "kurtis",
    price: 1899,
    salePrice: 1199,
    discount: 37,
    rating: 4.6,
    isNew: false,
    isFeatured: false,
    images: [
      "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1608930261073-455b55021571?auto=format&fit=crop&w=800&q=80"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Pastel Lilac", "Soft White"],
    description: "A chic everyday kurti featuring self-design chickenkari embroidery and delicate lace accents around the split neckline and sleeves.",
    details: [
      "Fabric: Cotton Georgette Blend",
      "Work: Chikankari embroidery",
      "Length: Knee-length",
      "Neckline: Mandarin collar with slit"
    ],
    reviews: []
  },
  {
    id: "maxi-01",
    name: "Elysian Rose Gold Maxi Dress",
    category: "maxi",
    price: 3299,
    salePrice: 1649,
    discount: 50,
    rating: 4.8,
    isNew: true,
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"
    ],
    sizes: ["S", "M", "L"],
    colors: ["Rose Gold", "Champagne Gold", "Lilac Pink"],
    description: "Drape yourself in luxury with the Elysian Maxi Dress. Featuring a soft pleated high-waist waistline, delicate spaghetti straps, and a thigh slit for a highly sophisticated modern evening silhouette.",
    details: [
      "Fabric: Premium Satin Crepe",
      "Features: Hidden zipper, adjustable straps",
      "Feel: Heavy, fluid drape that catch the light beautifully",
      "Occasion: Gala dinners, Cocktail events"
    ],
    reviews: [
      { id: 1, userName: "Rhea Sen", rating: 5, date: "2026-05-15", text: "The rose gold color is so elegant. Feels like a designer gown that would cost five times more." }
    ]
  },
  {
    id: "maxi-02",
    name: "Lavender Blossom Tiered Maxi",
    category: "maxi",
    price: 2799,
    salePrice: 1959,
    discount: 30,
    rating: 4.5,
    isNew: false,
    isFeatured: false,
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Lavender Floral", "Sage Green Floral"],
    description: "Flowing tiers of premium chiffon printed with abstract lavender blossoms make this summer maxi an absolute must-have. Breathable, comfortable, and effortlessly elegant.",
    details: [
      "Fabric: Lightweight Chiffon",
      "Structure: Tiered design with ruffle details",
      "Fit: Elasticated smocked back",
      "Wash: Gentle handwash"
    ],
    reviews: []
  },
  {
    id: "night-01",
    name: "Satin Lounge Pyjama Set",
    category: "nightwear",
    price: 2199,
    salePrice: 1099,
    discount: 50,
    rating: 4.9,
    isNew: true,
    isFeatured: false,
    images: [
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Classic Lavender", "Pearl White", "Charcoal Black"],
    description: "Unwind in luxury with this button-up satin pyjama set. Features a notch collar, contrast piping, elastic waist trousers, and an incredibly soft satin finish that glides on your skin.",
    details: [
      "Fabric: 100% Satin Polyester",
      "Set: Full sleeve top + elastic drawstring trousers",
      "Details: Front breast pocket with contrast embroidery",
      "Care: Machine wash cool, tumble dry low"
    ],
    reviews: [
      { id: 1, userName: "Nisha J.", rating: 5, date: "2026-05-20", text: "Best sleepwear purchase ever. The satin is so soft and has a rich gloss. Definitely buying another pair in charcoal." },
      { id: 2, userName: "Esha D.", rating: 5, date: "2026-06-11", text: "The fit is loose and comfortable, perfect for lounging on weekends." }
    ]
  },
  {
    id: "night-02",
    name: "Soft Cotton Ribbed Loungewear",
    category: "nightwear",
    price: 1699,
    salePrice: 1189,
    discount: 30,
    rating: 4.7,
    isNew: false,
    isFeatured: false,
    images: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80"
    ],
    sizes: ["S", "M", "L"],
    colors: ["Heather Gray", "Oatmeal Lilac"],
    description: "A ribbed knit lounge set featuring a relaxed-fit drop-shoulder sweater and matching wide-leg trousers. Breathable thermal comfort for cozy nights in.",
    details: [
      "Fabric: Organic Cotton Ribbed Blend",
      "Style: Two-piece crop sweater + high waist pants",
      "Stretch: Medium-high elasticity",
      "Comfort: Seamless tag labels"
    ],
    reviews: []
  },
  {
    id: "hijab-01",
    name: "Premium Chiffon Hijab in Lilac",
    category: "hijabs",
    price: 799,
    salePrice: 399,
    discount: 50,
    rating: 4.8,
    isNew: true,
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1609357518652-6cf0416f0cbe?auto=format&fit=crop&w=800&q=80"
    ],
    sizes: ["Free Size"],
    colors: ["Pastel Lilac", "Soft Rose Gold", "Pristine White", "Midnight Charcoal"],
    description: "Our signature premium chiffon hijabs are lightweight, breathable, and slightly textured to prevent slipping. Beautifully finished with neat baby hems, they are the ideal accessory for daily wear or formal drapes.",
    details: [
      "Fabric: High-grade bubble chiffon",
      "Dimensions: 180cm x 75cm",
      "Opacity: Sheer (double wrap recommended)",
      "Style: Slip-resistant weave"
    ],
    reviews: [
      { id: 1, userName: "Yasmin A.", rating: 5, date: "2026-05-02", text: "The texture is incredible. It drapes beautifully and doesn't slip off even without pins sometimes!" },
      { id: 2, userName: "Fatima B.", rating: 4, date: "2026-05-25", text: "Fabulous color. Exactly matches my Riza lavender kurti. Will buy more colors." }
    ]
  },
  {
    id: "hijab-02",
    name: "Luxury Modal Crimp Hijab",
    category: "hijabs",
    price: 999,
    salePrice: 699,
    discount: 30,
    rating: 4.7,
    isNew: false,
    isFeatured: false,
    images: [
      "https://images.unsplash.com/photo-1609357518652-6cf0416f0cbe?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
    ],
    sizes: ["Free Size"],
    colors: ["Rose Gold Nude", "Warm Sand", "Lavender Slate"],
    description: "Made from eco-friendly modal fibres, this crimp hijab provides premium volume and a beautiful, relaxed crinkle texture. Requires absolutely no ironing.",
    details: [
      "Fabric: 100% Bamboo Modal",
      "Dimensions: 190cm x 85cm",
      "Finish: Crinkled crimp fringe ends",
      "Care: Handwash warm"
    ],
    reviews: []
  },
  {
    id: "acc-01",
    name: "Elena Rose Gold Pendant Set",
    category: "accessories",
    price: 1599,
    salePrice: 799,
    discount: 50,
    rating: 4.8,
    isNew: true,
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"
    ],
    sizes: ["Free Size"],
    colors: ["Rose Gold", "Polished Silver"],
    description: "A luxury statement pendant set featuring an elegant rose gold-plated geometric crystal neck chain and matching studs. Designed to complement both modern maxi gowns and traditional ethnic wears.",
    details: [
      "Metal: 18k Rose Gold Plated Sterling Silver",
      "Stone: Premium AAA Cubic Zirconia crystals",
      "Chain: 45cm adjustable lobster clasp",
      "Hypoallergenic: Yes"
    ],
    reviews: [
      { id: 1, userName: "Diya Roy", rating: 5, date: "2026-06-01", text: "Dainty, beautiful, and shinier than expected. The packaging was also premium!" }
    ]
  },
  {
    id: "acc-02",
    name: "Clara Premium Leather Crossbody",
    category: "accessories",
    price: 2999,
    salePrice: 1999,
    discount: 33,
    rating: 4.9,
    isNew: false,
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=crop&w=800&q=80"
    ],
    sizes: ["One Size"],
    colors: ["Lavender Blush", "Soft Nude", "Pitch Charcoal"],
    description: "Elevate your accessorizing game with the Clara Crossbody. Built with premium vegan textured leather, metallic chain strap accents, and divided internal organizers for seamless storage.",
    details: [
      "Material: Premium Vegan Saffiano Leather",
      "Hardware: Rose gold polished locks",
      "Size: 22cm x 15cm x 7cm",
      "Strap: Detachable chain-link shoulder strap"
    ],
    reviews: [
      { id: 1, userName: "Megha Mehta", rating: 5, date: "2026-05-18", text: "Stunning craftsmanship. The color is a very subtle pastel lavender that coordinates perfectly with almost any look." }
    ]
  }
];
