#!/usr/bin/env node
// Fill empty example_en/example_th columns in the vocab CSVs from the map below.
// Safe: only touches rows whose example fields are blank; leaves every other
// column untouched. Re-runnable.  Usage: node scripts/vocab/fill-examples.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const FILES = ['pack2.csv', 'pack3.csv', 'pack4.csv']

// word (english, lowercased) -> [example_en, example_th]
const EX = {
  // numbers
  one: ['I have one.', 'ฉันมีหนึ่งอัน'], two: ['Two coffees please.', 'ขอกาแฟสองที่'],
  three: ['Three people.', 'สามคน'], four: ['Four o’clock.', 'สี่โมง'],
  five: ['Give me five.', 'ขอห้าอัน'], six: ['Six days.', 'หกวัน'],
  seven: ['Seven baht.', 'เจ็ดบาท'], eight: ['Eight hours.', 'แปดชั่วโมง'],
  nine: ['Nine people.', 'เก้าคน'], ten: ['Ten minutes.', 'สิบนาที'],
  hundred: ['One hundred baht.', 'หนึ่งร้อยบาท'], zero: ['Start from zero.', 'เริ่มจากศูนย์'],
  // colors
  red: ['I like the red one.', 'ฉันชอบอันสีแดง'], blue: ['The sky is blue.', 'ท้องฟ้าสีน้ำเงิน'],
  green: ['Green light.', 'ไฟเขียว'], yellow: ['A yellow flower.', 'ดอกไม้สีเหลือง'],
  black: ['A black bag.', 'กระเป๋าสีดำ'], white: ['A white shirt.', 'เสื้อสีขาว'],
  pink: ['A pink dress.', 'ชุดสีชมพู'], brown: ['Brown shoes.', 'รองเท้าสีน้ำตาล'],
  purple: ['A purple pen.', 'ปากกาสีม่วง'], gray: ['A gray cat.', 'แมวสีเทา'],
  gold: ['A gold ring.', 'แหวนทอง'],
  // family
  father: ['This is my father.', 'นี่คือพ่อของฉัน'], mother: ['My mother cooks well.', 'แม่ฉันทำอาหารเก่ง'],
  brother: ['I have one brother.', 'ฉันมีพี่ชายคนหนึ่ง'], sister: ['My sister is tall.', 'พี่สาวฉันสูง'],
  son: ['Their son is five.', 'ลูกชายเขาห้าขวบ'], daughter: ['My daughter is cute.', 'ลูกสาวฉันน่ารัก'],
  baby: ['The baby is sleeping.', 'ทารกกำลังนอน'], family: ['I love my family.', 'ฉันรักครอบครัว'],
  friend: ['He is my friend.', 'เขาเป็นเพื่อนฉัน'], husband: ['Her husband is kind.', 'สามีเธอใจดี'],
  wife: ['My wife is a teacher.', 'ภรรยาฉันเป็นครู'], grandmother: ['My grandmother is old.', 'ยายฉันแก่แล้ว'],
  // time
  today: ['I am busy today.', 'วันนี้ฉันยุ่ง'], tomorrow: ['See you tomorrow.', 'เจอกันพรุ่งนี้'],
  yesterday: ['I was sick yesterday.', 'เมื่อวานฉันป่วย'], morning: ['Good morning.', 'สวัสดีตอนเช้า'],
  afternoon: ['In the afternoon.', 'ตอนบ่าย'], evening: ['In the evening.', 'ตอนเย็น'],
  night: ['Good night.', 'ราตรีสวัสดิ์'], week: ['Next week.', 'สัปดาห์หน้า'],
  month: ['This month.', 'เดือนนี้'], year: ['Happy new year.', 'สวัสดีปีใหม่'],
  hour: ['One hour.', 'หนึ่งชั่วโมง'], minute: ['Wait a minute.', 'รอสักครู่'],
  // shopping
  price: ['What is the price?', 'ราคาเท่าไร'], cheap: ['It is very cheap.', 'ถูกมาก'],
  expensive: ['This is too expensive.', 'อันนี้แพงไป'], buy: ['I want to buy this.', 'ฉันอยากซื้ออันนี้'],
  pay: ['How can I pay?', 'จ่ายยังไง'], cash: ['I pay by cash.', 'จ่ายเงินสด'],
  card: ['Can I pay by card?', 'จ่ายบัตรได้ไหม'], discount: ['Any discount?', 'มีส่วนลดไหม'],
  change: ['Here is your change.', 'นี่เงินทอนครับ'], bag: ['Can I get a bag?', 'ขอถุงได้ไหม'],
  sale: ['It is on sale.', 'กำลังลดราคา'], size: ['What size do you want?', 'เอาไซซ์ไหน'],
  // hospital
  doctor: ['I need a doctor.', 'ฉันต้องการหมอ'], nurse: ['Ask the nurse.', 'ถามพยาบาล'],
  medicine: ['Take this medicine.', 'กินยานี้'], sick: ['I feel sick.', 'ฉันรู้สึกป่วย'],
  pain: ['I have a pain here.', 'ฉันเจ็บตรงนี้'], fever: ['I have a fever.', 'ฉันเป็นไข้'],
  headache: ['I have a headache.', 'ฉันปวดหัว'], hospital: ['Go to the hospital.', 'ไปโรงพยาบาล'],
  pharmacy: ['Find a pharmacy.', 'หาร้านขายยา'], ambulance: ['Call an ambulance.', 'เรียกรถพยาบาล'],
  tired: ['I am so tired.', 'ฉันเหนื่อยมาก'], rest: ['You need to rest.', 'คุณต้องพักผ่อน'],
  // transport
  car: ['I have a car.', 'ฉันมีรถ'], bus: ['Take the bus.', 'ขึ้นรถเมล์'],
  train: ['The train is late.', 'รถไฟมาช้า'], taxi: ['Call a taxi.', 'เรียกแท็กซี่'],
  motorbike: ['I ride a motorbike.', 'ฉันขี่มอเตอร์ไซค์'], boat: ['Take a boat.', 'นั่งเรือ'],
  bicycle: ['I ride a bicycle.', 'ฉันขี่จักรยาน'], airplane: ['The airplane is fast.', 'เครื่องบินเร็ว'],
  station: ['Where is the station?', 'สถานีอยู่ไหน'], road: ['Cross the road.', 'ข้ามถนน'],
  ticket: ['Buy a ticket.', 'ซื้อตั๋ว'], map: ['Look at the map.', 'ดูแผนที่'],
  // emotions
  happy: ['I am so happy.', 'ฉันมีความสุขมาก'], sad: ['Why are you sad?', 'ทำไมเศร้า'],
  angry: ['Don’t be angry.', 'อย่าโกรธ'], scared: ['I am scared.', 'ฉันกลัว'],
  bored: ['I am bored.', 'ฉันเบื่อ'], excited: ['I am excited.', 'ฉันตื่นเต้น'],
  surprised: ['She was surprised.', 'เธอประหลาดใจ'], love: ['I love you.', 'ฉันรักคุณ'],
  hungry: ['I am hungry.', 'ฉันหิว'], thirsty: ['I am thirsty.', 'ฉันหิวน้ำ'],
  sleepy: ['I feel sleepy.', 'ฉันง่วง'], fine: ['I am fine, thanks.', 'ฉันสบายดี ขอบคุณ'],
  // fruits
  apple: ['I eat an apple.', 'ฉันกินแอปเปิล'], banana: ['A yellow banana.', 'กล้วยสีเหลือง'],
  orange: ['An orange is sweet.', 'ส้มหวาน'], mango: ['I love mango.', 'ฉันชอบมะม่วง'],
  grape: ['Green grapes.', 'องุ่นเขียว'], watermelon: ['Watermelon is juicy.', 'แตงโมฉ่ำ'],
  strawberry: ['A red strawberry.', 'สตรอว์เบอร์รีสีแดง'], pineapple: ['Pineapple is sour.', 'สับปะรดเปรี้ยว'],
  lemon: ['A sour lemon.', 'เลมอนเปรี้ยว'], coconut: ['Fresh coconut.', 'มะพร้าวสด'],
  cherry: ['A small cherry.', 'เชอร์รีลูกเล็ก'], peach: ['A sweet peach.', 'พีชหวาน'],
  // jobs
  teacher: ['She is a teacher.', 'เธอเป็นครู'], student: ['I am a student.', 'ฉันเป็นนักเรียน'],
  police: ['Call the police.', 'เรียกตำรวจ'], farmer: ['He is a farmer.', 'เขาเป็นชาวนา'],
  cook: ['He is a good cook.', 'เขาเป็นพ่อครัวที่ดี'], driver: ['The driver is here.', 'คนขับมาแล้ว'],
  waiter: ['Ask the waiter.', 'ถามบริกร'], engineer: ['She is an engineer.', 'เธอเป็นวิศวกร'],
  seller: ['The seller is kind.', 'คนขายใจดี'], manager: ['Talk to the manager.', 'คุยกับผู้จัดการ'],
  worker: ['He is a hard worker.', 'เขาเป็นคนขยัน'],
  // house
  door: ['Close the door.', 'ปิดประตู'], window: ['Open the window.', 'เปิดหน้าต่าง'],
  table: ['Put it on the table.', 'วางบนโต๊ะ'], chair: ['Sit on the chair.', 'นั่งบนเก้าอี้'],
  bed: ['Make the bed.', 'จัดเตียง'], kitchen: ['Cook in the kitchen.', 'ทำอาหารในครัว'],
  room: ['A clean room.', 'ห้องสะอาด'], light: ['Turn off the light.', 'ปิดไฟ'],
  key: ['I lost my key.', 'ฉันทำกุญแจหาย'], clock: ['Look at the clock.', 'ดูนาฬิกา'],
  television: ['Watch television.', 'ดูโทรทัศน์'], fan: ['Turn on the fan.', 'เปิดพัดลม'],
  // animals
  dog: ['I have a dog.', 'ฉันมีหมา'], cat: ['The cat is cute.', 'แมวน่ารัก'],
  bird: ['A bird can fly.', 'นกบินได้'], fish: ['Fish live in water.', 'ปลาอยู่ในน้ำ'],
  cow: ['A cow gives milk.', 'วัวให้นม'], pig: ['A pink pig.', 'หมูสีชมพู'],
  chicken: ['I eat chicken.', 'ฉันกินไก่'], elephant: ['An elephant is big.', 'ช้างตัวใหญ่'],
  tiger: ['A tiger is strong.', 'เสือแข็งแรง'], monkey: ['A monkey is funny.', 'ลิงตลก'],
  snake: ['I am afraid of snakes.', 'ฉันกลัวงู'], horse: ['Ride a horse.', 'ขี่ม้า'],
  // vegetables
  carrot: ['I like carrots.', 'ฉันชอบแครอท'], potato: ['Fried potato.', 'มันฝรั่งทอด'],
  corn: ['Sweet corn.', 'ข้าวโพดหวาน'], broccoli: ['Eat your broccoli.', 'กินบรอกโคลี'],
  garlic: ['Add garlic.', 'ใส่กระเทียม'], mushroom: ['I like mushrooms.', 'ฉันชอบเห็ด'],
  chili: ['Too much chili.', 'พริกเยอะไป'], cabbage: ['Fresh cabbage.', 'กะหล่ำสด'],
  pumpkin: ['Pumpkin soup.', 'ซุปฟักทอง'], eggplant: ['Fried eggplant.', 'มะเขือทอด'],
  salad: ['A green salad.', 'สลัดผัก'], onion: ['Chop the onion.', 'สับหัวหอม'],
  spinach: ['Spinach is healthy.', 'ผักโขมดีต่อสุขภาพ'], ginger: ['Add some ginger.', 'ใส่ขิงหน่อย'],
  // verbs
  go: ['Let’s go.', 'ไปกันเถอะ'], come: ['Come here.', 'มานี่'],
  eat: ['Let’s eat.', 'กินข้าวกัน'], drink: ['Drink water.', 'ดื่มน้ำ'],
  sleep: ['I need to sleep.', 'ฉันต้องนอน'], walk: ['Walk slowly.', 'เดินช้า ๆ'],
  run: ['Don’t run.', 'อย่าวิ่ง'], read: ['I read a book.', 'ฉันอ่านหนังสือ'],
  write: ['Write your name.', 'เขียนชื่อคุณ'], speak: ['Speak slowly.', 'พูดช้า ๆ'],
  listen: ['Listen to me.', 'ฟังฉัน'], look: ['Look at this.', 'ดูอันนี้'],
  open: ['Open the box.', 'เปิดกล่อง'], close: ['Close the door.', 'ปิดประตู'],
  give: ['Give it to me.', 'ให้ฉัน'], take: ['Take this.', 'เอาอันนี้ไป'],
  // school
  book: ['Read this book.', 'อ่านหนังสือเล่มนี้'], pen: ['I need a pen.', 'ขอปากกา'],
  pencil: ['Use a pencil.', 'ใช้ดินสอ'], eraser: ['Where is the eraser?', 'ยางลบอยู่ไหน'],
  ruler: ['Use a ruler.', 'ใช้ไม้บรรทัด'], notebook: ['Open your notebook.', 'เปิดสมุด'],
  desk: ['Sit at your desk.', 'นั่งที่โต๊ะ'], homework: ['Do your homework.', 'ทำการบ้าน'],
  exam: ['The exam is hard.', 'ข้อสอบยาก'], class: ['I am in class.', 'ฉันอยู่ในห้องเรียน'],
  paper: ['A piece of paper.', 'กระดาษแผ่นหนึ่ง'], dictionary: ['Use a dictionary.', 'ใช้พจนานุกรม'],
  question: ['I have a question.', 'ฉันมีคำถาม'],
  // clothes
  shirt: ['A blue shirt.', 'เสื้อเชิ้ตสีน้ำเงิน'], 't-shirt': ['A white t-shirt.', 'เสื้อยืดสีขาว'],
  pants: ['New pants.', 'กางเกงใหม่'], dress: ['A pretty dress.', 'ชุดสวย'],
  shoes: ['My shoes are new.', 'รองเท้าฉันใหม่'], hat: ['Wear a hat.', 'ใส่หมวก'],
  socks: ['Clean socks.', 'ถุงเท้าสะอาด'], jacket: ['Wear a jacket.', 'ใส่แจ็คเก็ต'],
  skirt: ['A long skirt.', 'กระโปรงยาว'], glasses: ['I wear glasses.', 'ฉันใส่แว่น'],
  watch: ['A nice watch.', 'นาฬิกาสวย'], belt: ['A black belt.', 'เข็มขัดสีดำ'],
  gloves: ['Warm gloves.', 'ถุงมืออุ่น'], scarf: ['A red scarf.', 'ผ้าพันคอสีแดง'],
  // places
  bank: ['Go to the bank.', 'ไปธนาคาร'], market: ['Buy fruit at the market.', 'ซื้อผลไม้ที่ตลาด'],
  park: ['Walk in the park.', 'เดินเล่นในสวน'], temple: ['Visit the temple.', 'ไปวัด'],
  mall: ['Meet at the mall.', 'เจอกันที่ห้าง'], cinema: ['Go to the cinema.', 'ไปโรงหนัง'],
  library: ['Read at the library.', 'อ่านที่ห้องสมุด'], museum: ['Visit the museum.', 'ไปพิพิธภัณฑ์'],
  zoo: ['The zoo is fun.', 'สวนสัตว์สนุก'], gym: ['I go to the gym.', 'ฉันไปยิม'],
  church: ['Go to church.', 'ไปโบสถ์'], bakery: ['Fresh bread at the bakery.', 'ขนมปังสดที่เบเกอรี'],
  school: ['Go to school.', 'ไปโรงเรียน'], street: ['Cross the street.', 'ข้ามถนน'],
  // directions
  left: ['Turn left.', 'เลี้ยวซ้าย'], right: ['Turn right.', 'เลี้ยวขวา'],
  straight: ['Go straight.', 'ตรงไป'], near: ['It is near here.', 'อยู่ใกล้ ๆ นี่'],
  far: ['It is very far.', 'ไกลมาก'], here: ['Come here.', 'มาที่นี่'],
  there: ['It is over there.', 'อยู่ตรงนั้น'], up: ['Look up.', 'มองขึ้น'],
  down: ['Sit down.', 'นั่งลง'], turn: ['Turn at the corner.', 'เลี้ยวตรงหัวมุม'],
  stop: ['Stop here.', 'หยุดตรงนี้'], corner: ['At the corner.', 'ตรงหัวมุม'],
  sign: ['Read the sign.', 'อ่านป้าย'], cross: ['Cross the road.', 'ข้ามถนน'],
  // adjectives
  big: ['A big house.', 'บ้านหลังใหญ่'], small: ['A small dog.', 'หมาตัวเล็ก'],
  tall: ['He is tall.', 'เขาสูง'], short: ['A short story.', 'เรื่องสั้น'],
  long: ['A long road.', 'ถนนยาว'], new: ['A new phone.', 'โทรศัพท์ใหม่'],
  old: ['An old car.', 'รถเก่า'], fast: ['A fast train.', 'รถไฟเร็ว'],
  slow: ['A slow bus.', 'รถเมล์ช้า'], good: ['A good idea.', 'ความคิดที่ดี'],
  bad: ['Bad weather.', 'อากาศแย่'], easy: ['This is easy.', 'อันนี้ง่าย'],
  hard: ['This is hard.', 'อันนี้ยาก'], beautiful: ['A beautiful view.', 'วิวสวย'],
  clean: ['A clean room.', 'ห้องสะอาด'], dirty: ['Dirty shoes.', 'รองเท้าสกปรก'],
  // greetings
  hello: ['Hello, how are you?', 'สวัสดี สบายดีไหม'], goodbye: ['Goodbye, see you.', 'ลาก่อน เจอกันใหม่'],
  'thank you': ['Thank you very much.', 'ขอบคุณมาก'], sorry: ['I am sorry.', 'ฉันขอโทษ'],
  please: ['Water, please.', 'ขอน้ำหน่อย'], 'excuse me': ['Excuse me, where is the toilet?', 'ขอโทษ ห้องน้ำอยู่ไหน'],
  yes: ['Yes, please.', 'ครับ/ค่ะ เอา'], no: ['No, thank you.', 'ไม่ ขอบคุณ'],
  welcome: ['You are welcome.', 'ยินดีต้อนรับ'], help: ['Help me, please.', 'ช่วยด้วย'],
  okay: ['Okay, no problem.', 'โอเค ไม่มีปัญหา'], 'good night': ['Good night, sleep well.', 'ราตรีสวัสดิ์ นอนหลับฝันดี'],
  'good morning': ['Good morning, everyone.', 'อรุณสวัสดิ์ทุกคน'], 'nice to meet you': ['Nice to meet you.', 'ยินดีที่ได้รู้จัก'],
  'see you': ['See you later.', 'ไว้เจอกันใหม่'], 'how are you': ['How are you today?', 'วันนี้เป็นยังไงบ้าง'],
  // days
  monday: ['See you on Monday.', 'เจอกันวันจันทร์'], tuesday: ['A meeting on Tuesday.', 'ประชุมวันอังคาร'],
  wednesday: ['It is Wednesday.', 'วันนี้วันพุธ'], thursday: ['I am free on Thursday.', 'วันพฤหัสฉันว่าง'],
  friday: ['Happy Friday!', 'สุขสันต์วันศุกร์'], saturday: ['I rest on Saturday.', 'วันเสาร์ฉันพัก'],
  sunday: ['Sunday is a holiday.', 'วันอาทิตย์เป็นวันหยุด'], weekend: ['Have a nice weekend.', 'สุดสัปดาห์ให้สนุก'],
  holiday: ['It is a holiday today.', 'วันนี้เป็นวันหยุด'], birthday: ['Happy birthday!', 'สุขสันต์วันเกิด'],
  calendar: ['Check the calendar.', 'ดูปฏิทิน'], weekday: ['I work on weekdays.', 'ฉันทำงานวันธรรมดา'],
  day: ['Have a nice day.', 'ขอให้เป็นวันที่ดี'], date: ['What is the date today?', 'วันนี้วันที่เท่าไร'],
  // months
  january: ['My birthday is in January.', 'วันเกิดฉันเดือนมกราคม'], february: ['February is short.', 'กุมภาพันธ์เดือนสั้น'],
  march: ['It is hot in March.', 'มีนาคมอากาศร้อน'], april: ['Songkran is in April.', 'สงกรานต์อยู่เดือนเมษายน'],
  may: ['It rains in May.', 'พฤษภาคมฝนตก'], june: ['School starts in June.', 'เปิดเรียนเดือนมิถุนายน'],
  july: ['July is rainy.', 'กรกฎาคมฝนเยอะ'], august: ['I travel in August.', 'ฉันเที่ยวเดือนสิงหาคม'],
  september: ['September is cool.', 'กันยายนอากาศเย็น'], october: ['October is nice.', 'ตุลาคมอากาศดี'],
  november: ['November is cool.', 'พฤศจิกายนอากาศเย็น'], december: ['December is cold.', 'ธันวาคมหนาว'],
  // sports
  football: ['I play football.', 'ฉันเล่นฟุตบอล'], basketball: ['Play basketball.', 'เล่นบาสเกตบอล'],
  tennis: ['She plays tennis.', 'เธอเล่นเทนนิส'], swimming: ['I like swimming.', 'ฉันชอบว่ายน้ำ'],
  running: ['Running is good.', 'การวิ่งดีต่อสุขภาพ'], boxing: ['He likes boxing.', 'เขาชอบมวย'],
  badminton: ['Let’s play badminton.', 'ไปเล่นแบดกัน'], golf: ['My dad plays golf.', 'พ่อฉันเล่นกอล์ฟ'],
  volleyball: ['We play volleyball.', 'เราเล่นวอลเลย์บอล'], cycling: ['I enjoy cycling.', 'ฉันชอบปั่นจักรยาน'],
  yoga: ['I do yoga.', 'ฉันเล่นโยคะ'], 'ping pong': ['Play ping pong.', 'เล่นปิงปอง'],
  team: ['We are a team.', 'เราเป็นทีมเดียวกัน'], ball: ['Throw the ball.', 'โยนลูกบอล'],
  // technology
  phone: ['Answer the phone.', 'รับโทรศัพท์'], computer: ['Turn on the computer.', 'เปิดคอมพิวเตอร์'],
  internet: ['The internet is slow.', 'อินเทอร์เน็ตช้า'], email: ['Send me an email.', 'ส่งอีเมลมาให้ฉัน'],
  password: ['Enter your password.', 'ใส่รหัสผ่าน'], app: ['Download the app.', 'ดาวน์โหลดแอป'],
  screen: ['The screen is bright.', 'หน้าจอสว่าง'], camera: ['Turn on the camera.', 'เปิดกล้อง'],
  battery: ['The battery is low.', 'แบตใกล้หมด'], charger: ['Where is my charger?', 'ที่ชาร์จอยู่ไหน'],
  keyboard: ['Use the keyboard.', 'ใช้คีย์บอร์ด'], mouse: ['Click with the mouse.', 'คลิกด้วยเมาส์'],
  website: ['Visit the website.', 'เข้าเว็บไซต์'], message: ['Send a message.', 'ส่งข้อความ'],
  // money
  money: ['I have no money.', 'ฉันไม่มีเงิน'], coin: ['A gold coin.', 'เหรียญทอง'],
  banknote: ['A 100-baht banknote.', 'ธนบัตรร้อยบาท'], atm: ['Find an ATM.', 'หาตู้เอทีเอ็ม'],
  salary: ['A good salary.', 'เงินเดือนดี'], wallet: ['I lost my wallet.', 'ฉันทำกระเป๋าเงินหาย'],
  save: ['I save money.', 'ฉันเก็บเงิน'], spend: ['Don’t spend too much.', 'อย่าใช้เงินเยอะ'],
  rich: ['He is rich.', 'เขารวย'], poor: ['They are poor.', 'พวกเขาจน'],
  exchange: ['Exchange money here.', 'แลกเงินที่นี่'], credit: ['Pay by credit card.', 'จ่ายด้วยบัตรเครดิต'],
  tip: ['Leave a tip.', 'ให้ทิป'], account: ['Open an account.', 'เปิดบัญชี'],
  // nature
  sea: ['The sea is blue.', 'ทะเลสีฟ้า'], beach: ['Relax on the beach.', 'พักผ่อนที่ชายหาด'],
  mountain: ['Climb the mountain.', 'ปีนภูเขา'], river: ['Swim in the river.', 'ว่ายน้ำในแม่น้ำ'],
  forest: ['A green forest.', 'ป่าเขียว'], island: ['A small island.', 'เกาะเล็ก ๆ'],
  sky: ['The sky is clear.', 'ท้องฟ้าแจ่มใส'], moon: ['Look at the moon.', 'ดูพระจันทร์'],
  star: ['A bright star.', 'ดาวสว่าง'], tree: ['A big tree.', 'ต้นไม้ใหญ่'],
  flower: ['A pretty flower.', 'ดอกไม้สวย'], wave: ['A big wave.', 'คลื่นใหญ่'],
  sand: ['Soft sand.', 'ทรายนุ่ม'], lake: ['A calm lake.', 'ทะเลสาบเงียบสงบ'],
  // questions
  what: ['What is this?', 'นี่คืออะไร'], where: ['Where are you?', 'คุณอยู่ที่ไหน'],
  when: ['When do we start?', 'เริ่มเมื่อไหร่'], who: ['Who is that?', 'นั่นใคร'],
  why: ['Why not?', 'ทำไมล่ะ'], how: ['How does it work?', 'มันทำงานยังไง'],
  'how much': ['How much is it?', 'ราคาเท่าไร'], 'how many': ['How many do you want?', 'เอากี่อัน'],
  which: ['Which one?', 'อันไหน'], can: ['Can you help me?', 'ช่วยฉันได้ไหม'],
  want: ['I want this.', 'ฉันอยากได้อันนี้'], need: ['I need help.', 'ฉันต้องการความช่วยเหลือ'],
  do: ['What do you do?', 'คุณทำงานอะไร'], will: ['I will call you.', 'ฉันจะโทรหาคุณ'],
  // furniture
  sofa: ['Sit on the sofa.', 'นั่งบนโซฟา'], lamp: ['Turn on the lamp.', 'เปิดโคมไฟ'],
  mirror: ['Look in the mirror.', 'ส่องกระจก'], shelf: ['Put it on the shelf.', 'วางบนชั้น'],
  curtain: ['Open the curtain.', 'เปิดผ้าม่าน'], carpet: ['A soft carpet.', 'พรมนุ่ม'],
  pillow: ['A soft pillow.', 'หมอนนุ่ม'], drawer: ['Open the drawer.', 'เปิดลิ้นชัก'],
  sink: ['Wash it in the sink.', 'ล้างในอ่าง'], toilet: ['Where is the toilet?', 'ห้องน้ำอยู่ไหน'],
  stairs: ['Use the stairs.', 'ใช้บันได'], closet: ['Clothes in the closet.', 'เสื้อผ้าในตู้'],
  bathtub: ['Fill the bathtub.', 'เติมน้ำในอ่างอาบน้ำ'], cupboard: ['Cups in the cupboard.', 'ถ้วยในตู้'],
  // cooking
  cut: ['Cut the vegetables.', 'หั่นผัก'], fry: ['Fry the egg.', 'ทอดไข่'],
  boil: ['Boil the water.', 'ต้มน้ำ'], bake: ['Bake a cake.', 'อบเค้ก'],
  mix: ['Mix it well.', 'ผสมให้เข้ากัน'], wash: ['Wash the rice.', 'ล้างข้าว'],
  peel: ['Peel the banana.', 'ปอกกล้วย'], pour: ['Pour the milk.', 'เทนม'],
  taste: ['Taste the soup.', 'ชิมซุป'], add: ['Add some salt.', 'ใส่เกลือหน่อย'],
  stir: ['Stir the soup.', 'คนซุป'], chop: ['Chop the onion.', 'สับหัวหอม'],
  serve: ['Serve it hot.', 'เสิร์ฟตอนร้อน'],
  // drinks
  juice: ['Orange juice, please.', 'ขอน้ำส้ม'], soda: ['A cold soda.', 'น้ำอัดลมเย็น ๆ'],
  beer: ['A cold beer.', 'เบียร์เย็น'], wine: ['A glass of wine.', 'ไวน์แก้วหนึ่ง'],
  smoothie: ['A mango smoothie.', 'สมูทตี้มะม่วง'], milkshake: ['A chocolate milkshake.', 'มิลค์เชคช็อกโกแลต'],
  lemonade: ['Fresh lemonade.', 'น้ำมะนาวสด'], cola: ['A can of cola.', 'โคล่ากระป๋องหนึ่ง'],
  'coconut water': ['Cold coconut water.', 'น้ำมะพร้าวเย็น'], 'soy milk': ['A glass of soy milk.', 'นมถั่วเหลืองแก้วหนึ่ง'],
  'hot chocolate': ['A warm hot chocolate.', 'ช็อกโกแลตร้อนอุ่น ๆ'], 'iced tea': ['Sweet iced tea.', 'ชาเย็นหวาน'],
  water: ['Drink some water.', 'ดื่มน้ำ'], ice: ['Add some ice.', 'ใส่น้ำแข็งหน่อย'],
}

function csvCell(v) {
  const s = v ?? ''
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
function serialize(cols) {
  return cols.map(csvCell).join(',')
}

function parseLine(line) {
  const out = []
  let field = '', q = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (q) {
      if (c === '"') { if (line[i + 1] === '"') { field += '"'; i++ } else q = false } else field += c
    } else if (c === '"') q = true
    else if (c === ',') { out.push(field); field = '' }
    else field += c
  }
  out.push(field)
  return out
}

let filled = 0, missing = new Set()
for (const file of FILES) {
  const path = join(here, file)
  const lines = readFileSync(path, 'utf8').split('\n')
  const header = parseLine(lines[0]).map((h) => h.trim().toLowerCase())
  const cWord = header.indexOf('word')
  const cEn = header.indexOf('example_en')
  const cTh = header.indexOf('example_th')
  const outLines = [lines[0]]
  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i]
    if (raw.trim() === '') { outLines.push(raw); continue }
    const cols = parseLine(raw)
    const word = (cols[cWord] ?? '').trim().toLowerCase()
    if (!(cols[cEn] ?? '').trim() && EX[word]) {
      cols[cEn] = EX[word][0]
      cols[cTh] = EX[word][1]
      filled++
      outLines.push(serialize(cols))
    } else {
      if (!(cols[cEn] ?? '').trim() && word) missing.add(word)
      outLines.push(raw)
    }
  }
  writeFileSync(path, outLines.join('\n'))
}
console.error(`✓ filled ${filled} example rows`)
if (missing.size) console.error(`⚠ still missing (${missing.size}): ${[...missing].join(', ')}`)
