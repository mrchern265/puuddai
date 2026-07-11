-- =============================================================================
-- PuudDai seed: ยูนิต "ที่ด่านตรวจคนเข้าเมือง (ตม.)"
-- -----------------------------------------------------------------------------
-- เนื้อหาบทเรียนทั้งหมดของแอปเก็บอยู่ในฐานข้อมูล Supabase (ตาราง units / lessons /
-- scenarios) ไม่ได้อยู่ในโค้ด ไฟล์นี้จึงเป็นสคริปต์ "seed" สำหรับเพิ่มยูนิตใหม่
-- เรื่องการผ่านด่าน ตม. (immigration) เวลาเดินทางไปต่างประเทศ แล้วเจ้าหน้าที่ถามคำถาม
--
-- วิธีใช้:
--   1) เปิด Supabase Dashboard > SQL Editor ของโปรเจกต์ แล้ววางสคริปต์นี้ Run
--      (หรือ psql "$DATABASE_URL" -f supabase/seeds/immigration_unit.sql)
--   2) สคริปต์จะต่อท้ายเป็นยูนิตถัดไปโดยอัตโนมัติ (order_index = MAX ปัจจุบัน + 1)
--   3) รันซ้ำได้อย่างปลอดภัย — ถ้ามียูนิตชื่อเดียวกันอยู่แล้วจะข้าม (ดู guard ด้านล่าง)
--
-- หมายเหตุ:
--   * สคริปต์อาศัยว่าคอลัมน์ id มีค่า default (เช่น gen_random_uuid()) ตามสคีมาปกติ
--     ของแอป ถ้าตารางของคุณตั้ง id เป็นชนิดอื่นที่ไม่มี default ให้กำหนด id เองเพิ่ม
--   * โครงสร้าง content_json อ้างอิงจาก src/types.ts (LessonContent):
--       listen{audioText,thaiExplain} · vocab[] · examples[] · quiz[]
--   * ค่า type ของ lesson ตั้งเป็น 'lesson' ให้ปรับให้ตรงกับข้อมูลเดิมของคุณได้
-- =============================================================================

DO $do$
DECLARE
  v_unit_id units.id%TYPE;
  v_next_order integer;
BEGIN
  -- กันการ seed ซ้ำ
  IF EXISTS (SELECT 1 FROM units WHERE title_th = 'ที่ด่านตรวจคนเข้าเมือง (ตม.)') THEN
    RAISE NOTICE 'ยูนิต ตม. มีอยู่แล้ว — ข้ามการ seed';
    RETURN;
  END IF;

  SELECT COALESCE(MAX(order_index), 0) + 1 INTO v_next_order FROM units;

  INSERT INTO units (order_index, title_th, description_th, cefr_level, milestone_badge)
  VALUES (
    v_next_order,
    'ที่ด่านตรวจคนเข้าเมือง (ตม.)',
    'เวลาเดินทางไปต่างประเทศ ต้องผ่านด่าน ตม. (immigration) แล้วเจ้าหน้าที่มักถามเป็นภาษาอังกฤษ ยูนิตนี้รวมคำศัพท์ ประโยคที่เจ้าหน้าที่ถามบ่อย และวิธีตอบให้ผ่านด่านอย่างมั่นใจ',
    'A1',
    '🛂 ผ่านด่าน ตม. ได้สบายมาก'
  )
  RETURNING id INTO v_unit_id;

  -- ---------------------------------------------------------------------------
  -- บทที่ 1: คำศัพท์พื้นฐานที่ด่าน ตม.
  -- ---------------------------------------------------------------------------
  INSERT INTO lessons (unit_id, order_index, type, title_th, content_json)
  VALUES (v_unit_id, 1, 'lesson', 'คำศัพท์พื้นฐานที่ด่าน ตม.', $json$
  {
    "listen": {
      "audioText": "Welcome. Passport, please. What is the purpose of your visit?",
      "thaiExplain": "นี่คือประโยคแรกที่เจ้าหน้าที่ ตม. มักพูด: ทักทาย แล้วขอดูหนังสือเดินทาง จากนั้นถามว่ามาทำอะไร ลองฟังคำว่า passport (หนังสือเดินทาง) และ purpose (จุดประสงค์) ให้ชิน"
    },
    "vocab": [
      {
        "word": "passport",
        "ipa": "/ˈpæs.pɔːrt/",
        "thai": "หนังสือเดินทาง",
        "exampleEn": "Here is my passport.",
        "exampleTh": "นี่หนังสือเดินทางของผมครับ",
        "associationHintTh": "แพส-พอร์ต = pass (ผ่าน) + port (ท่า) เอกสารสำหรับผ่านด่าน"
      },
      {
        "word": "immigration",
        "ipa": "/ˌɪm.ɪˈɡreɪ.ʃən/",
        "thai": "ด่านตรวจคนเข้าเมือง (ตม.)",
        "exampleEn": "The immigration officer checked my passport.",
        "exampleTh": "เจ้าหน้าที่ ตม. ตรวจหนังสือเดินทางของผม",
        "associationHintTh": "อิม-มิ-เกร-ชั่น นึกถึงป้าย Immigration ที่สนามบิน"
      },
      {
        "word": "visa",
        "ipa": "/ˈviː.zə/",
        "thai": "วีซ่า (เอกสารอนุญาตเข้าประเทศ)",
        "exampleEn": "I have a tourist visa.",
        "exampleTh": "ผมมีวีซ่านักท่องเที่ยว",
        "associationHintTh": "วี-ซ่า ออกเสียงเหมือนบัตร Visa เลย จำง่าย"
      },
      {
        "word": "purpose",
        "ipa": "/ˈpɜːr.pəs/",
        "thai": "จุดประสงค์ / มาทำอะไร",
        "exampleEn": "The purpose of my visit is tourism.",
        "exampleTh": "จุดประสงค์การมาของผมคือท่องเที่ยว",
        "associationHintTh": "เพอร์-เพิส เจ้าหน้าที่ถามว่ามา 'เพื่อ' อะไร"
      },
      {
        "word": "tourist",
        "ipa": "/ˈtʊr.ɪst/",
        "thai": "นักท่องเที่ยว",
        "exampleEn": "I am a tourist.",
        "exampleTh": "ผมเป็นนักท่องเที่ยว",
        "associationHintTh": "ทัว-ริสต์ มาจาก tour (ทัวร์/เที่ยว)"
      },
      {
        "word": "arrival",
        "ipa": "/əˈraɪ.vəl/",
        "thai": "ขาเข้า / การมาถึง",
        "exampleEn": "Please follow the arrival sign.",
        "exampleTh": "กรุณาเดินตามป้ายขาเข้า",
        "associationHintTh": "อะ-ไร-เวิ่ล มาจาก arrive (มาถึง) ตรงข้ามกับ departure (ขาออก)"
      }
    ],
    "examples": [
      { "en": "Good afternoon. Passport, please.", "th": "สวัสดีตอนบ่ายครับ ขอดูหนังสือเดินทางครับ" },
      { "en": "What is the purpose of your visit?", "th": "คุณมาที่นี่เพื่ออะไร" },
      { "en": "I am here on holiday.", "th": "ผมมาเที่ยวพักผ่อนครับ" },
      { "en": "I am a tourist.", "th": "ผมเป็นนักท่องเที่ยวครับ" }
    ],
    "quiz": [
      {
        "questionTh": "\"passport\" แปลว่าอะไร",
        "choices": ["ตั๋วเครื่องบิน", "หนังสือเดินทาง", "กระเป๋าเดินทาง", "วีซ่า"],
        "answerIndex": 1,
        "explainTh": "passport = หนังสือเดินทาง เอกสารที่ใช้ยื่นให้เจ้าหน้าที่ ตม."
      },
      {
        "questionTh": "เจ้าหน้าที่ถาม \"What is the purpose of your visit?\" หมายความว่าอะไร",
        "choices": ["คุณจะพักที่ไหน", "คุณมาทำอะไร / มาเพื่ออะไร", "คุณมาจากประเทศไหน", "คุณจะอยู่กี่วัน"],
        "answerIndex": 1,
        "explainTh": "purpose of your visit = จุดประสงค์ของการมา เจ้าหน้าที่อยากรู้ว่ามาเที่ยว มาทำงาน หรือมาเรียน"
      },
      {
        "questionTh": "อยากบอกว่า \"ผมมาเที่ยว\" ควรพูดว่าอะไร",
        "choices": ["I am a student.", "I am here on holiday.", "I live here.", "I am working."],
        "answerIndex": 1,
        "explainTh": "\"I am here on holiday.\" = ผมมาพักผ่อน/มาเที่ยว เป็นคำตอบมาตรฐานของนักท่องเที่ยว"
      }
    ]
  }
  $json$::jsonb);

  -- ---------------------------------------------------------------------------
  -- บทที่ 2: ตอบคำถามที่เจ้าหน้าที่ ตม. ถามบ่อย
  -- ---------------------------------------------------------------------------
  INSERT INTO lessons (unit_id, order_index, type, title_th, content_json)
  VALUES (v_unit_id, 2, 'lesson', 'ตอบคำถามที่ ตม. ถามบ่อย', $json$
  {
    "listen": {
      "audioText": "How long will you stay? Where will you stay? Do you have a return ticket?",
      "thaiExplain": "สามคำถามยอดฮิตของเจ้าหน้าที่ ตม.: จะอยู่กี่วัน จะพักที่ไหน และมีตั๋วขากลับไหม เตรียมคำตอบสั้น ๆ ไว้ล่วงหน้าจะช่วยให้ผ่านด่านเร็วขึ้น"
    },
    "vocab": [
      {
        "word": "stay",
        "ipa": "/steɪ/",
        "thai": "พัก / อยู่",
        "exampleEn": "I will stay for seven days.",
        "exampleTh": "ผมจะอยู่เจ็ดวันครับ",
        "associationHintTh": "สเตย์ เหมือนคำว่า stay ในโรงแรมที่แปลว่า 'เข้าพัก'"
      },
      {
        "word": "hotel",
        "ipa": "/hoʊˈtel/",
        "thai": "โรงแรม",
        "exampleEn": "I will stay at a hotel.",
        "exampleTh": "ผมจะพักที่โรงแรม",
        "associationHintTh": "โฮ-เทล คำเดียวกับ 'โรงแรม' ที่คนไทยพูดว่าโฮเทล"
      },
      {
        "word": "week",
        "ipa": "/wiːk/",
        "thai": "สัปดาห์",
        "exampleEn": "I will stay for one week.",
        "exampleTh": "ผมจะอยู่หนึ่งสัปดาห์",
        "associationHintTh": "วีค 1 week = 7 วัน ใช้บอกระยะเวลาที่จะอยู่"
      },
      {
        "word": "return",
        "ipa": "/rɪˈtɜːrn/",
        "thai": "กลับ / ขากลับ",
        "exampleEn": "Yes, I have a return ticket.",
        "exampleTh": "มีครับ ผมมีตั๋วขากลับ",
        "associationHintTh": "รี-เทิร์น re (อีกครั้ง) + turn (หัน) = หันกลับ, ตั๋ว return คือตั๋วขากลับ"
      },
      {
        "word": "business",
        "ipa": "/ˈbɪz.nɪs/",
        "thai": "ธุระ / ทำงาน",
        "exampleEn": "I am here on business.",
        "exampleTh": "ผมมาทำธุระ/มาทำงานครับ",
        "associationHintTh": "บิส-เนส ถ้ามาทำงานตอบแบบนี้ ถ้ามาเที่ยวใช้ on holiday"
      },
      {
        "word": "address",
        "ipa": "/ˈæd.res/",
        "thai": "ที่อยู่",
        "exampleEn": "This is the hotel address.",
        "exampleTh": "นี่คือที่อยู่ของโรงแรมครับ",
        "associationHintTh": "แอด-เดรส เตรียมชื่อ/ที่อยู่โรงแรมไว้โชว์ได้เลย"
      }
    ],
    "examples": [
      { "en": "How long will you stay?", "th": "คุณจะอยู่นานแค่ไหน" },
      { "en": "I will stay for one week.", "th": "ผมจะอยู่หนึ่งสัปดาห์ครับ" },
      { "en": "Where will you stay?", "th": "คุณจะพักที่ไหน" },
      { "en": "I will stay at a hotel in the city.", "th": "ผมจะพักที่โรงแรมในเมืองครับ" },
      { "en": "Do you have a return ticket?", "th": "คุณมีตั๋วขากลับไหม" },
      { "en": "Yes, I have a return ticket.", "th": "มีครับ ผมมีตั๋วขากลับ" }
    ],
    "quiz": [
      {
        "questionTh": "เจ้าหน้าที่ถาม \"How long will you stay?\" ควรตอบว่าอะไร",
        "choices": ["At a hotel.", "For one week.", "On holiday.", "By plane."],
        "answerIndex": 1,
        "explainTh": "How long = นานแค่ไหน ตอบเป็นระยะเวลา เช่น \"For one week.\" (หนึ่งสัปดาห์)"
      },
      {
        "questionTh": "เจ้าหน้าที่ถาม \"Where will you stay?\" กำลังถามอะไร",
        "choices": ["จะอยู่กี่วัน", "จะพักที่ไหน", "มากับใคร", "มาทำอะไร"],
        "answerIndex": 1,
        "explainTh": "Where = ที่ไหน ตอบชื่อโรงแรมหรือที่พัก เช่น \"At a hotel in the city.\""
      },
      {
        "questionTh": "\"Do you have a return ticket?\" ถ้าคุณมีตั๋วขากลับ ควรตอบว่า",
        "choices": ["No, thank you.", "Yes, I have a return ticket.", "I am a tourist.", "For one week."],
        "answerIndex": 1,
        "explainTh": "return ticket = ตั๋วขากลับ ถ้ามีก็ตอบ \"Yes, I have a return ticket.\" และเตรียมโชว์ตั๋วได้"
      }
    ]
  }
  $json$::jsonb);

  -- ---------------------------------------------------------------------------
  -- บทที่ 3: ประโยคช่วยชีวิตเมื่อฟังไม่ทัน
  -- ---------------------------------------------------------------------------
  INSERT INTO lessons (unit_id, order_index, type, title_th, content_json)
  VALUES (v_unit_id, 3, 'lesson', 'ประโยคช่วยชีวิตเมื่อฟังไม่ทัน', $json$
  {
    "listen": {
      "audioText": "Sorry, could you say that again, please? Could you speak slowly, please?",
      "thaiExplain": "ถ้าฟังเจ้าหน้าที่ไม่ทัน ไม่ต้องตกใจ ใช้สองประโยคนี้ขอให้พูดซ้ำหรือพูดช้าลงได้เลย สุภาพและใช้ได้จริงทุกสถานการณ์"
    },
    "vocab": [
      {
        "word": "sorry",
        "ipa": "/ˈsɑːr.i/",
        "thai": "ขอโทษ / ขออภัย",
        "exampleEn": "Sorry, I don't understand.",
        "exampleTh": "ขอโทษครับ ผมไม่เข้าใจ",
        "associationHintTh": "ซอ-รี่ ขึ้นต้นด้วยคำนี้เวลาจะขอให้พูดซ้ำ ฟังดูสุภาพ"
      },
      {
        "word": "repeat",
        "ipa": "/rɪˈpiːt/",
        "thai": "พูดซ้ำ",
        "exampleEn": "Could you repeat that, please?",
        "exampleTh": "ช่วยพูดอีกครั้งได้ไหมครับ",
        "associationHintTh": "รี-พีท re (อีกครั้ง) + peat เหมือนปุ่ม repeat เพลง"
      },
      {
        "word": "slowly",
        "ipa": "/ˈsloʊ.li/",
        "thai": "ช้า ๆ",
        "exampleEn": "Please speak slowly.",
        "exampleTh": "กรุณาพูดช้า ๆ ครับ",
        "associationHintTh": "สโล-ลี่ มาจาก slow (ช้า) เติม -ly เป็นวิธีการ"
      },
      {
        "word": "understand",
        "ipa": "/ˌʌn.dɚˈstænd/",
        "thai": "เข้าใจ",
        "exampleEn": "I don't understand.",
        "exampleTh": "ผมไม่เข้าใจครับ",
        "associationHintTh": "อัน-เดอร์-สแตนด์ บอกว่าเข้าใจ/ไม่เข้าใจก็ใช้คำนี้"
      },
      {
        "word": "English",
        "ipa": "/ˈɪŋ.ɡlɪʃ/",
        "thai": "ภาษาอังกฤษ",
        "exampleEn": "I speak a little English.",
        "exampleTh": "ผมพูดภาษาอังกฤษได้นิดหน่อยครับ",
        "associationHintTh": "อิง-กลิช บอกไว้ก่อนว่าพูดได้นิดหน่อย เจ้าหน้าที่จะพูดช้าลงให้"
      }
    ],
    "examples": [
      { "en": "Sorry, could you say that again, please?", "th": "ขอโทษครับ ช่วยพูดอีกครั้งได้ไหมครับ" },
      { "en": "Could you speak slowly, please?", "th": "ช่วยพูดช้า ๆ ได้ไหมครับ" },
      { "en": "Sorry, I don't understand.", "th": "ขอโทษครับ ผมไม่เข้าใจ" },
      { "en": "I speak a little English.", "th": "ผมพูดภาษาอังกฤษได้นิดหน่อยครับ" },
      { "en": "Thank you very much.", "th": "ขอบคุณมากครับ" }
    ],
    "quiz": [
      {
        "questionTh": "ถ้าฟังเจ้าหน้าที่ไม่ทัน อยากให้พูดซ้ำ ควรพูดว่า",
        "choices": ["Thank you.", "Could you say that again, please?", "I am a tourist.", "Goodbye."],
        "answerIndex": 1,
        "explainTh": "\"Could you say that again, please?\" = ช่วยพูดอีกครั้งได้ไหม สุภาพและได้ผล"
      },
      {
        "questionTh": "\"Please speak slowly.\" แปลว่าอะไร",
        "choices": ["กรุณาพูดดัง ๆ", "กรุณาพูดช้า ๆ", "กรุณาพูดซ้ำ", "กรุณาเงียบ"],
        "answerIndex": 1,
        "explainTh": "slowly = ช้า ๆ ประโยคนี้ขอให้เจ้าหน้าที่พูดช้าลงเพื่อให้ฟังทัน"
      },
      {
        "questionTh": "อยากบอกว่า \"ผมไม่เข้าใจ\" ต้องพูดว่า",
        "choices": ["I understand.", "I don't understand.", "I am fine.", "I don't know you."],
        "answerIndex": 1,
        "explainTh": "\"I don't understand.\" = ผมไม่เข้าใจ บอกตรง ๆ ได้เลยเมื่อฟังไม่ออก"
      }
    ]
  }
  $json$::jsonb);

  -- ---------------------------------------------------------------------------
  -- สถานการณ์ฝึกสนทนากับ AI (หน้า "ฝึกสนทนา")
  -- ---------------------------------------------------------------------------
  INSERT INTO scenarios (unit_id, title_th, setting_en, ai_role, user_goal_th, success_criteria_json)
  VALUES (
    v_unit_id,
    'ผ่านด่าน ตม. ที่สนามบิน',
    'At the airport immigration counter, right after landing in another country. The traveler is a tourist arriving for a holiday.',
    'a friendly airport immigration officer',
    'ตอบคำถามของเจ้าหน้าที่ ตม. ให้ครบ (มาทำอะไร จะอยู่กี่วัน พักที่ไหน) เพื่อผ่านด่านเข้าประเทศให้ได้',
    $json$[
      "บอกจุดประสงค์การเดินทางได้ (เช่น มาเที่ยว/พักผ่อน)",
      "บอกจำนวนวันที่จะพักได้",
      "บอกได้ว่าจะพักที่ไหน",
      "สื่อสารอย่างสุภาพ และขอให้พูดซ้ำได้เมื่อฟังไม่ทัน"
    ]$json$::jsonb
  );

  RAISE NOTICE 'seed ยูนิต ตม. สำเร็จ (unit order_index = %)', v_next_order;
END
$do$;
