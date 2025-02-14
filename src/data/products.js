export const products = [
  {
    id: 1,
    name: "Lavanta Kokulu Mum",
    description: "Sakinleştirici lavanta özlü, el yapımı doğal mum",
    detailedDescription: `Fransız lavantası özleriyle hazırlanan bu el yapımı mum, evinize huzur ve rahatlama getirecek. 
    %100 soya mumu bazlı olan ürünümüz, 40-50 saat yanma süresi sunar. 
    Cam kavanoz içerisinde 180gr ağırlığındadır.
    
    Özellikler:
    - %100 Doğal soya mumu
    - Fransız lavanta özü
    - 40-50 saat yanma süresi
    - El yapımı pamuk fitil
    - Yeniden kullanılabilir cam kavanoz`,
    price: 129.99,
    image: "/images/candle-1.jpg",
    isNew: true,
    discount: 0,
    reviews: [
      { id: 1, user: "Ayşe Y.", rating: 5, comment: "Harika bir koku, evim mis gibi lavanta kokuyor.", date: "2024-02-01" },
      { id: 2, user: "Mehmet K.", rating: 4, comment: "Uzun süre yanıyor, kokusu çok güzel.", date: "2024-01-28" },
      { id: 3, user: "Zeynep A.", rating: 5, comment: "Çok beğendim, tekrar alacağım.", date: "2024-01-25" }
    ]
  },
  {
    id: 2,
    name: "Vanilya Aromali Mum",
    description: "Tatlı vanilya kokulu, uzun ömürlü soya mumu",
    detailedDescription: `Madagaskar vanilyası özleriyle hazırlanan bu özel mum, evinize sıcak ve tatlı bir atmosfer katacak.
    %100 soya mumu bazlı olan ürünümüz, 35-45 saat yanma süresi sunar.
    Cam kavanoz içerisinde 150gr ağırlığındadır.
    
    Özellikler:
    - %100 Doğal soya mumu
    - Madagaskar vanilya özü
    - 35-45 saat yanma süresi
    - El yapımı pamuk fitil
    - Yeniden kullanılabilir cam kavanoz`,
    price: 149.99,
    image: "/images/candle-2.jpg",
    isNew: false,
    discount: 15,
    reviews: [
      { id: 4, user: "Can B.", rating: 5, comment: "Vanilya kokusu çok doğal, harika!", date: "2024-02-03" },
      { id: 5, user: "Elif S.", rating: 3, comment: "Güzel ama biraz daha güçlü kokabilirdi.", date: "2024-01-30" }
    ]
  },
  {
    id: 3,
    name: "Sandal Ağacı Mumu",
    description: "Egzotik sandal ağacı kokulu, lüks tasarım mum",
    detailedDescription: `Hint sandal ağacı özleriyle hazırlanan bu lüks mum, evinize egzotik ve sofistike bir hava katacak.
    %100 soya mumu bazlı olan ürünümüz, 50-60 saat yanma süresi sunar.
    Özel tasarım seramik kap içerisinde 200gr ağırlığındadır.
    
    Özellikler:
    - %100 Doğal soya mumu
    - Hint sandal ağacı özü
    - 50-60 saat yanma süresi
    - El yapımı pamuk fitil
    - Özel tasarım seramik kap`,
    price: 199.99,
    image: "/images/candle-3.jpg",
    isNew: false,
    discount: 0,
    reviews: [
      { id: 6, user: "Deniz T.", rating: 5, comment: "Muhteşem bir koku, çok şık bir tasarım.", date: "2024-02-02" },
      { id: 7, user: "Berk A.", rating: 5, comment: "Premium kalitede bir ürün.", date: "2024-01-29" },
      { id: 8, user: "Selin K.", rating: 4, comment: "Harika bir hediye seçeneği.", date: "2024-01-27" }
    ]
  },
  {
    id: 4,
    name: "Okyanus Esintisi",
    description: "Ferah okyanus kokusu ile rahatlatıcı mum",
    detailedDescription: `Taze okyanus esintisi kokularıyla hazırlanan bu ferah mum, evinize sahil kenarı serinliği getirecek.
    %100 soya mumu bazlı olan ürünümüz, 45-55 saat yanma süresi sunar.
    Mavi cam kavanoz içerisinde 190gr ağırlığındadır.
    
    Özellikler:
    - %100 Doğal soya mumu
    - Okyanus esintisi aroması
    - 45-55 saat yanma süresi
    - El yapımı pamuk fitil
    - Özel mavi cam kavanoz`,
    price: 169.99,
    image: "/images/candle-4.jpg",
    isNew: true,
    discount: 10,
    reviews: [
      { id: 9, user: "Mert Y.", rating: 4, comment: "Çok ferah bir koku.", date: "2024-02-04" },
      { id: 10, user: "İrem A.", rating: 5, comment: "Yazı evimize getiren harika bir ürün.", date: "2024-02-01" }
    ]
  },
  {
    id: 5,
    name: "Tarçın & Elma",
    description: "Sıcak tarçın ve tatlı elma aromalı kış mumu",
    detailedDescription: `Taze elma ve Ceylon tarçını ile hazırlanan bu sıcak kokulu mum, evinize kış aylarının sıcaklığını getirecek.
    %100 soya mumu bazlı olan ürünümüz, 40-50 saat yanma süresi sunar.
    Kırmızı cam kavanoz içerisinde 175gr ağırlığındadır.
    
    Özellikler:
    - %100 Doğal soya mumu
    - Ceylon tarçını ve elma özü
    - 40-50 saat yanma süresi
    - El yapımı pamuk fitil
    - Özel kırmızı cam kavanoz`,
    price: 159.99,
    image: "/images/candle-6.jpg",
    isNew: false,
    discount: 0,
    reviews: [
      { id: 11, user: "Ceren B.", rating: 5, comment: "Kış ayları için mükemmel bir seçim.", date: "2024-02-03" },
      { id: 12, user: "Tolga S.", rating: 4, comment: "Çok güzel bir hediye oldu.", date: "2024-01-31" }
    ]
  },
  {
    id: 6,
    name: "Yasemin Bahçesi",
    description: "Zarif yasemin kokulu, el yapımı doğal mum",
    detailedDescription: `Taze yasemin çiçeği özleriyle hazırlanan bu zarif mum, evinize bahar tazeliği getirecek.
    %100 soya mumu bazlı olan ürünümüz, 35-45 saat yanma süresi sunar.
    Beyaz cam kavanoz içerisinde 160gr ağırlığındadır.
    
    Özellikler:
    - %100 Doğal soya mumu
    - Yasemin çiçeği özü
    - 35-45 saat yanma süresi
    - El yapımı pamuk fitil
    - Özel beyaz cam kavanoz`,
    price: 139.99,
    image: "/images/candle-5.jpg",
    isNew: false,
    discount: 20,
    reviews: [
      { id: 13, user: "Aslı M.", rating: 5, comment: "Yasemin kokusu çok doğal ve güzel.", date: "2024-02-02" },
      { id: 14, user: "Burak T.", rating: 4, comment: "Hoş bir bahar kokusu.", date: "2024-01-30" },
      { id: 15, user: "Pınar K.", rating: 5, comment: "Harika bir ürün, tekrar alacağım.", date: "2024-01-28" }
    ]
  }
]; 