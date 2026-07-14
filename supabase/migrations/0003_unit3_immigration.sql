-- Unit 3: ผ่านด่าน ตม. (Immigration & Customs)
-- Run this in Supabase SQL Editor for project: hljonpvkdgwkmjiwupeu
-- JSON payloads use dollar-quoting ($j$...$j$) so apostrophes inside text need no escaping.

DO $$
DECLARE
  u3_id  uuid := gen_random_uuid();
  l1_id  uuid := gen_random_uuid();
  l2_id  uuid := gen_random_uuid();
  l3_id  uuid := gen_random_uuid();
  sc3_id uuid := gen_random_uuid();
BEGIN

-- ─── UNIT ───────────────────────────────────────────────────────────────────
INSERT INTO units (id, order_index, title_th, description_th, cefr_level, milestone_badge)
VALUES (
  u3_id, 3,
  $j$ผ่านด่าน ตม.$j$,
  $j$ตอบคำถามเจ้าหน้าที่ ผ่านศุลกากร ขอความช่วยเหลือ$j$,
  'A1', '🛂'
);

-- ─── LESSON 1: ที่เคาน์เตอร์ ตม. ─────────────────────────────────────────
INSERT INTO lessons (id, unit_id, order_index, type, title_th, content_json)
VALUES (
  l1_id, u3_id, 1, 'communication', $j$ที่เคาน์เตอร์ ตม.$j$,
  $j${
    "listen": {
      "audioText": "Good morning. What is the purpose of your visit? I am here for tourism. How long will you stay? About ten days. Where will you be staying? At the Grand Hotel in Bangkok. Enjoy your stay!",
      "thaiExplain": "บทสนทนานี้เกิดขึ้นที่เคาน์เตอร์ตรวจคนเข้าเมือง เจ้าหน้าที่จะถาม 3 อย่างหลักๆ คือ วัตถุประสงค์ ระยะเวลาพัก และสถานที่พัก ตอบสั้นๆ ชัดๆ ก็พอ"
    },
    "vocab": [
      {
        "word": "passport",
        "ipa": "/ˈpæspɔːrt/",
        "thai": "หนังสือเดินทาง",
        "exampleEn": "Please show your passport.",
        "exampleTh": "กรุณาแสดงหนังสือเดินทางของคุณ",
        "associationHintTh": "คิดถึง pass = ผ่าน + port = ท่าเรือ เอกสารที่ใช้ผ่านด่าน"
      },
      {
        "word": "purpose",
        "ipa": "/ˈpɜːrpəs/",
        "thai": "วัตถุประสงค์",
        "exampleEn": "What is the purpose of your visit?",
        "exampleTh": "วัตถุประสงค์ของการมาเยือนคืออะไร?",
        "associationHintTh": "ออกเสียง เพอร์เพิส — จุดมุ่งหมายที่ต้องการบรรลุ"
      },
      {
        "word": "tourism",
        "ipa": "/ˈtʊərɪzəm/",
        "thai": "การท่องเที่ยว",
        "exampleEn": "I am here for tourism.",
        "exampleTh": "ผมมาเพื่อท่องเที่ยว",
        "associationHintTh": "คิดถึง tour = ทัวร์ที่คุ้นเคย + ism = ระบบ/การกระทำ"
      },
      {
        "word": "stay",
        "ipa": "/steɪ/",
        "thai": "พัก / อยู่",
        "exampleEn": "How long will you stay?",
        "exampleTh": "คุณจะพักอยู่นานแค่ไหน?",
        "associationHintTh": "สเตย์ — เหมือนพูดว่า stay ที่โรงแรม ความหมายตรงตัวเลย"
      },
      {
        "word": "hotel",
        "ipa": "/hoʊˈtɛl/",
        "thai": "โรงแรม",
        "exampleEn": "I will be staying at the Grand Hotel.",
        "exampleTh": "ผมจะพักที่โรงแรมแกรนด์",
        "associationHintTh": "โฮเทล — ออกเสียงเกือบเหมือนภาษาไทยเลย"
      }
    ],
    "examples": [
      {"en": "What is the purpose of your visit?", "th": "วัตถุประสงค์การมาเยือนของคุณคืออะไร?"},
      {"en": "I am here for tourism.", "th": "ผมมาเพื่อท่องเที่ยว"},
      {"en": "I am here on business.", "th": "ผมมาเพื่อธุรกิจ"},
      {"en": "How long will you stay?", "th": "คุณจะพักอยู่นานแค่ไหน?"},
      {"en": "About ten days.", "th": "ประมาณสิบวัน"},
      {"en": "Where will you be staying?", "th": "คุณจะพักที่ไหน?"},
      {"en": "At the Grand Hotel in Bangkok.", "th": "ที่โรงแรมแกรนด์ กรุงเทพฯ"}
    ],
    "quiz": [
      {
        "questionTh": "เจ้าหน้าที่ถาม 'What is the purpose of your visit?' ถ้าไปเที่ยวตอบว่าอะไร?",
        "choices": ["Business meeting.", "I am here for tourism.", "I live here.", "I am a student."],
        "answerIndex": 1,
        "explainTh": "I am here for tourism. = ผมมาเพื่อท่องเที่ยว เป็นคำตอบมาตรฐานสำหรับนักท่องเที่ยว"
      },
      {
        "questionTh": "คำว่า passport หมายความว่าอะไร?",
        "choices": ["ตั๋วเครื่องบิน", "วีซ่า", "หนังสือเดินทาง", "บัตรประจำตัว"],
        "answerIndex": 2,
        "explainTh": "Passport = หนังสือเดินทาง เอกสารสำคัญที่สุดเมื่อเดินทางต่างประเทศ"
      },
      {
        "questionTh": "ถ้าจะพัก 7 วัน ตอบว่าอย่างไร?",
        "choices": ["Seven week.", "About seven days.", "Seven month.", "Many days."],
        "answerIndex": 1,
        "explainTh": "About seven days. = ประมาณเจ็ดวัน คำว่า about ช่วยให้ฟังดูเป็นธรรมชาติ"
      },
      {
        "questionTh": "'Where will you be staying?' ถามเรื่องอะไร?",
        "choices": ["ระยะเวลาพัก", "วัตถุประสงค์การเดินทาง", "สถานที่พัก", "สัมภาระ"],
        "answerIndex": 2,
        "explainTh": "Where = ที่ไหน / staying = พัก รวมกันแปลว่า คุณจะพักที่ไหน?"
      }
    ]
  }$j$::jsonb
);

-- ─── LESSON 2: ที่ด่านศุลกากร ─────────────────────────────────────────────
INSERT INTO lessons (id, unit_id, order_index, type, title_th, content_json)
VALUES (
  l2_id, u3_id, 2, 'communication', $j$ที่ด่านศุลกากร$j$,
  $j${
    "listen": {
      "audioText": "Do you have anything to declare? No, I have nothing to declare. Please open your bag. Of course. Are these items for personal use? Yes, they are gifts for my family. You may proceed. Thank you!",
      "thaiExplain": "ที่ด่านศุลกากร เจ้าหน้าที่จะถามว่ามีของต้องแจ้งไหม ของส่วนตัวและของขวัญมักไม่ต้องเสียภาษี แต่สินค้าที่นำมาขายหรือมูลค่าสูงต้องแจ้ง"
    },
    "vocab": [
      {
        "word": "customs",
        "ipa": "/ˈkʌstəmz/",
        "thai": "ศุลกากร",
        "exampleEn": "I passed through customs quickly.",
        "exampleTh": "ผมผ่านด่านศุลกากรได้เร็ว",
        "associationHintTh": "คัสตัมส์ — ด่านตรวจสินค้าที่นำเข้าออกประเทศ"
      },
      {
        "word": "declare",
        "ipa": "/dɪˈkleər/",
        "thai": "แจ้ง / ประกาศ",
        "exampleEn": "Do you have anything to declare?",
        "exampleTh": "คุณมีสิ่งของที่ต้องแจ้งไหม?",
        "associationHintTh": "คิดถึง declaration of independence = คำประกาศ — แจ้งอย่างเป็นทางการ"
      },
      {
        "word": "personal",
        "ipa": "/ˈpɜːrsənəl/",
        "thai": "ส่วนตัว",
        "exampleEn": "These are for personal use.",
        "exampleTh": "ของพวกนี้ใช้ส่วนตัว",
        "associationHintTh": "person = คน + al = เกี่ยวกับ รวมกัน = เกี่ยวกับตัวบุคคล"
      },
      {
        "word": "proceed",
        "ipa": "/prəˈsiːd/",
        "thai": "ผ่านได้ / ดำเนินต่อไป",
        "exampleEn": "You may proceed.",
        "exampleTh": "คุณผ่านได้เลย",
        "associationHintTh": "ได้ยินบ่อยที่ ตม. ตอนเจ้าหน้าที่อนุญาตให้ผ่าน"
      },
      {
        "word": "luggage",
        "ipa": "/ˈlʌɡɪdʒ/",
        "thai": "สัมภาระ / กระเป๋าเดินทาง",
        "exampleEn": "Please put your luggage on the belt.",
        "exampleTh": "กรุณาวางสัมภาระบนสายพาน",
        "associationHintTh": "ลักกิจ — สัมภาระทั้งหมดที่พกพาระหว่างเดินทาง"
      }
    ],
    "examples": [
      {"en": "Do you have anything to declare?", "th": "คุณมีสิ่งของที่ต้องแจ้งไหม?"},
      {"en": "No, I have nothing to declare.", "th": "ไม่ครับ ผมไม่มีสิ่งของที่ต้องแจ้ง"},
      {"en": "Please open your bag.", "th": "กรุณาเปิดกระเป๋า"},
      {"en": "These are for personal use.", "th": "ของพวกนี้ใช้ส่วนตัว"},
      {"en": "These are gifts for my family.", "th": "นี่คือของขวัญสำหรับครอบครัวผม"},
      {"en": "You may proceed.", "th": "คุณผ่านได้เลย"}
    ],
    "quiz": [
      {
        "questionTh": "'Do you have anything to declare?' หมายความว่าอะไร?",
        "choices": ["คุณมีของต้องห้ามไหม?", "คุณมีสิ่งของที่ต้องแจ้งไหม?", "คุณพักกี่วัน?", "คุณมาจากไหน?"],
        "answerIndex": 1,
        "explainTh": "declare = แจ้งต่อเจ้าหน้าที่ สิ่งของมูลค่าสูงหรือสินค้าต้องแจ้งให้ถูกต้อง"
      },
      {
        "questionTh": "ถ้าไม่มีของต้องแจ้ง ตอบว่าอย่างไร?",
        "choices": ["Yes, I declare everything.", "I do not know.", "No, I have nothing to declare.", "Please check my bag."],
        "answerIndex": 2,
        "explainTh": "Nothing to declare = ไม่มีสิ่งของที่ต้องแจ้ง เป็นประโยคสำคัญที่ใช้บ่อยที่ศุลกากร"
      },
      {
        "questionTh": "Luggage แปลว่าอะไร?",
        "choices": ["ป้ายชื่อ", "สัมภาระ", "บัตรโดยสาร", "หนังสือเดินทาง"],
        "answerIndex": 1,
        "explainTh": "Luggage = สัมภาระ รวมถึงกระเป๋าเดินทางทุกใบที่นำมา"
      },
      {
        "questionTh": "เจ้าหน้าที่พูดว่า 'You may proceed.' หมายความว่าอะไร?",
        "choices": ["รอก่อน", "เปิดกระเป๋า", "ผ่านได้เลย", "แสดงหนังสือเดินทาง"],
        "answerIndex": 2,
        "explainTh": "You may proceed = คุณผ่านได้เลย — เจ้าหน้าที่อนุญาตให้ผ่าน"
      }
    ]
  }$j$::jsonb
);

-- ─── LESSON 3: ขอความช่วยเหลือ ────────────────────────────────────────────
INSERT INTO lessons (id, unit_id, order_index, type, title_th, content_json)
VALUES (
  l3_id, u3_id, 3, 'communication', $j$ขอความช่วยเหลือ$j$,
  $j${
    "listen": {
      "audioText": "Excuse me, I do not understand. Could you please repeat that? I am sorry, could you speak more slowly? Can you write that down for me? I need an interpreter. Thank you for your patience.",
      "thaiExplain": "เมื่อไม่เข้าใจสิ่งที่เจ้าหน้าที่พูด ใช้ประโยคเหล่านี้ขอให้พูดซ้ำหรือพูดช้าลง ไม่ต้องอาย การขอความช่วยเหลือถูกต้องดีกว่าเดา"
    },
    "vocab": [
      {
        "word": "repeat",
        "ipa": "/rɪˈpiːt/",
        "thai": "พูดซ้ำ / ทำซ้ำ",
        "exampleEn": "Could you repeat that, please?",
        "exampleTh": "คุณช่วยพูดซ้ำได้ไหม?",
        "associationHintTh": "รีพีท — ออกเสียงคล้ายภาษาไทย ทำซ้ำอีกครั้ง"
      },
      {
        "word": "slowly",
        "ipa": "/ˈsloʊli/",
        "thai": "ช้าๆ",
        "exampleEn": "Please speak more slowly.",
        "exampleTh": "กรุณาพูดช้าลงหน่อย",
        "associationHintTh": "slow = ช้า + ly = รูปกริยาวิเศษณ์ รวมกัน = อย่างช้าๆ"
      },
      {
        "word": "interpreter",
        "ipa": "/ɪnˈtɜːrprɪtər/",
        "thai": "ล่าม",
        "exampleEn": "I need an interpreter.",
        "exampleTh": "ผมต้องการล่าม",
        "associationHintTh": "interpret = แปลความหมาย + er = ผู้ทำ รวมกัน = ผู้แปลภาษา"
      },
      {
        "word": "understand",
        "ipa": "/ˌʌndərˈstænd/",
        "thai": "เข้าใจ",
        "exampleEn": "I do not understand.",
        "exampleTh": "ผมไม่เข้าใจ",
        "associationHintTh": "อันเดอร์สแตนด์ — ใช้บ่อยมาก บอกตรงๆ ดีกว่าทำทีว่าเข้าใจ"
      },
      {
        "word": "write down",
        "ipa": "/raɪt daʊn/",
        "thai": "เขียนลง",
        "exampleEn": "Can you write that down for me?",
        "exampleTh": "คุณช่วยเขียนลงให้ผมได้ไหม?",
        "associationHintTh": "write = เขียน + down = ลง รวมกัน = จดบันทึก"
      }
    ],
    "examples": [
      {"en": "I do not understand.", "th": "ผมไม่เข้าใจ"},
      {"en": "Could you repeat that?", "th": "คุณช่วยพูดซ้ำได้ไหมครับ?"},
      {"en": "Please speak more slowly.", "th": "กรุณาพูดช้าลงหน่อย"},
      {"en": "Can you write that down?", "th": "คุณช่วยเขียนลงให้ผมได้ไหม?"},
      {"en": "I need an interpreter.", "th": "ผมต้องการล่าม"},
      {"en": "Which line should I stand in?", "th": "ผมควรยืนต่อแถวไหน?"}
    ],
    "quiz": [
      {
        "questionTh": "ถ้าอยากให้เจ้าหน้าที่พูดซ้ำ บอกว่าอย่างไร?",
        "choices": ["I do not like that.", "Could you repeat that?", "I want to go now.", "Please be quiet."],
        "answerIndex": 1,
        "explainTh": "Could you repeat that? = ช่วยพูดซ้ำได้ไหม? สุภาพและใช้งานได้ทันที"
      },
      {
        "questionTh": "'Please speak more slowly.' แปลว่าอะไร?",
        "choices": ["กรุณาพูดดังขึ้น", "กรุณาพูดช้าลง", "กรุณาพูดภาษาไทย", "กรุณาหยุดพูด"],
        "answerIndex": 1,
        "explainTh": "slowly = ช้าๆ / more slowly = ช้าลง ใช้เมื่อเจ้าหน้าที่พูดเร็วเกินไปจนฟังไม่ทัน"
      },
      {
        "questionTh": "คำว่า interpreter หมายความว่าอะไร?",
        "choices": ["ล่าม/นักแปล", "เจ้าหน้าที่", "ผู้โดยสาร", "ผู้ตรวจสอบ"],
        "answerIndex": 0,
        "explainTh": "Interpreter = ล่าม ผู้แปลภาษาพูด ถ้าสื่อสารไม่ได้ขอล่ามได้เลย"
      },
      {
        "questionTh": "ประโยคไหนใช้เมื่อไม่เข้าใจสิ่งที่เจ้าหน้าที่พูด?",
        "choices": ["I agree.", "I do not understand.", "I am fine, thank you.", "Let us go."],
        "answerIndex": 1,
        "explainTh": "I do not understand. = ผมไม่เข้าใจ บอกตรงๆ ดีกว่าทำทีว่าเข้าใจแล้วเกิดปัญหาทีหลัง"
      }
    ]
  }$j$::jsonb
);

-- ─── SCENARIO (AI Conversation) ────────────────────────────────────────────
INSERT INTO scenarios (id, unit_id, title_th, setting_en, ai_role, user_goal_th, success_criteria_json)
VALUES (
  sc3_id, u3_id,
  $j$สนทนากับเจ้าหน้าที่ ตม.$j$,
  $j$You are at an international airport immigration counter. You are an immigration officer who needs to verify the traveler's purpose, duration, and accommodation.$j$,
  'immigration officer',
  $j$ผ่านด่าน ตม. โดยตอบคำถาม 3 อย่าง: วัตถุประสงค์การเดินทาง ระยะเวลาพัก และสถานที่พัก$j$,
  $j$["บอกวัตถุประสงค์การเดินทาง เช่น tourism หรือ business", "บอกระยะเวลาที่จะพัก", "บอกชื่อโรงแรมหรือสถานที่พัก"]$j$::jsonb
);

END $$;
