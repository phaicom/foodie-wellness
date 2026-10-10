<script setup lang="ts">
const { say } = useFoodie()
const groups = computed(() => [
  {
    title: say('A kinder approach to weight loss', 'ลดน้ำหนักอย่างอ่อนโยน'),
    icon: 'i-lucide-scale',
    color: 'sage',
    intro: say(
      'Consistency matters more than a perfect day.',
      'ความสม่ำเสมอสำคัญกว่าวันที่สมบูรณ์แบบ',
    ),
    rules: [
      [
        say('Keep your deficit moderate', 'ลดพลังงานอย่างพอดี'),
        say(
          'Use a small, sustainable deficit. Avoid crash diets or skipping meals to compensate.',
          'ลดพลังงานทีละน้อยอย่างยั่งยืน ไม่อดอาหารหรือข้ามมื้อเพื่อชดเชย',
        ),
        say(
          'Try a 250-500 kcal estimated deficit, adjusted to your needs.',
          'ลองลดประมาณ 250-500 กิโลแคลอรี โดยปรับตามความต้องการ',
        ),
      ],
      [
        say('Notice oil & portion sizes', 'ใส่ใจน้ำมันและปริมาณ'),
        say(
          'Cooking methods and comfortable portions often matter more than banning a favorite dish.',
          'วิธีปรุงและปริมาณที่พอดีมักสำคัญกว่าการห้ามอาหารที่ชอบ',
        ),
        say(
          'Ask for less oil in fried rice and add extra vegetables.',
          'สั่งข้าวผัดน้ำมันน้อยและเพิ่มผัก',
        ),
      ],
      [
        say('Build a balanced plate', 'จัดมื้ออาหารให้สมดุล'),
        say(
          'Include protein, vegetables or fruit, and a satisfying carbohydrate source. Avoid unnecessary restrictions.',
          'มีโปรตีน ผักหรือผลไม้ และคาร์โบไฮเดรตที่อิ่มพอดี ไม่จำกัดเกินจำเป็น',
        ),
        say(
          'Rice, a modest protein serving and cooked greens make a simple meal.',
          'ข้าว โปรตีนพอดี และผักสุก เป็นมื้อง่ายๆ',
        ),
      ],
      [
        say(
          'Watch trends, not daily changes',
          'ดูแนวโน้ม ไม่ใช่การเปลี่ยนรายวัน',
        ),
        say(
          'Water, salt and digestion affect scale readings. A seven-day average gives more context.',
          'น้ำ เกลือ และการย่อยทำให้น้ำหนักผันผวน ค่าเฉลี่ย 7 วันช่วยให้เห็นภาพ',
        ),
        say(
          'Weigh under similar conditions when you choose to check in.',
          'ชั่งในสภาพใกล้เคียงกันเมื่อสะดวก',
        ),
      ],
    ],
  },
  {
    title: say('Make room for reflux comfort', 'กินสบายเมื่อมีกรดไหลย้อน'),
    icon: 'i-lucide-heart-pulse',
    color: 'rose',
    intro: say(
      'Your triggers are personal. Curiosity beats a long banned-food list.',
      'สิ่งกระตุ้นเป็นเรื่องเฉพาะคน ลองสังเกตแทนการห้ามอาหารมากมาย',
    ),
    rules: [
      [
        say('Choose smaller, comfortable meals', 'เลือกมื้อเล็กที่พอดี'),
        say(
          'Large or high-fat meals may aggravate symptoms. Spread food across the day if that suits you.',
          'มื้อใหญ่หรือไขมันสูงอาจทำให้อาการมากขึ้น แบ่งมื้อหากเหมาะกับคุณ',
        ),
        say(
          'A small bowl of chicken rice soup can be easier than a large oily meal.',
          'ข้าวต้มไก่ชามเล็กอาจสบายกว่ามื้อใหญ่มันๆ',
        ),
      ],
      [
        say('Give dinner time to settle', 'เว้นเวลาหลังอาหารเย็น'),
        say(
          'Finish eating at least 3 hours before lying down, especially if you have nighttime symptoms.',
          'กินเสร็จก่อนนอนอย่างน้อย 3 ชั่วโมง โดยเฉพาะเมื่อมีอาการกลางคืน',
        ),
        say(
          'If bedtime is 10 pm, aim to finish dinner by 7 pm.',
          'ถ้านอน 22 นาฬิกา พยายามกินเสร็จ 19 นาฬิกา',
        ),
      ],
      [
        say('Learn your own triggers', 'รู้จักสิ่งกระตุ้นของตัวเอง'),
        say(
          'Chili, citrus, coffee or fatty foods bother some people. Track your response rather than automatically banning them all.',
          'พริก ส้ม กาแฟ หรือไขมันกระตุ้นบางคน บันทึกอาการแทนการห้ามทั้งหมด',
        ),
        say(
          'Try mild basil chicken and note how you feel afterwards.',
          'ลองกะเพราไม่เผ็ดแล้วบันทึกว่ารู้สึกอย่างไร',
        ),
      ],
      [
        say('Record symptoms with context', 'บันทึกอาการพร้อมบริบท'),
        say(
          'Note the meal, time, portion and possible triggers. Patterns can inform a conversation with your clinician.',
          'จดมื้อ เวลา ปริมาณ และสิ่งที่อาจกระตุ้น แนวโน้มช่วยในการคุยกับผู้ดูแลสุขภาพ',
        ),
        say(
          'A relationship in your log is a clue, not proof of a cause.',
          'ความสัมพันธ์ในบันทึกเป็นเบาะแส ไม่ใช่ข้อพิสูจน์',
        ),
      ],
    ],
  },
  {
    title: say('A balanced lower-purine pattern', 'กินพิวรีนต่ำอย่างสมดุล'),
    icon: 'i-lucide-leaf',
    color: 'sand',
    intro: say(
      'Variety, moderate portions and steady habits.',
      'หลากหลาย ปริมาณพอดี และนิสัยสม่ำเสมอ',
    ),
    rules: [
      [
        say('Avoid organ meats', 'หลีกเลี่ยงเครื่องใน'),
        say(
          'Liver, kidney and other organ meats are high-purine choices.',
          'ตับ ไต และเครื่องในอื่นๆ มีพิวรีนสูง',
        ),
        say(
          'Swap liver for egg or tofu in your stir-fry.',
          'เปลี่ยนตับเป็นไข่หรือเต้าหู้ในผัด',
        ),
      ],
      [
        say('Be selective with seafood', 'เลือกอาหารทะเลอย่างใส่ใจ'),
        say(
          'Limit high-purine seafood such as sardines, anchovies and shellfish. Moderate meat and fish portions.',
          'จำกัดปลาซาร์ดีน แอนโชวี และสัตว์ทะเลมีเปลือก กินเนื้อและปลาพอดี',
        ),
        say(
          'Choose a modest fish serving rather than a large seafood platter.',
          'เลือกปลาปริมาณพอดีแทนอาหารทะเลจานใหญ่',
        ),
      ],
      [
        say('Vary your proteins', 'กินโปรตีนหลากหลาย'),
        say(
          'Eggs, tofu and low-fat dairy can fit the pattern. Plant proteins do not need to be broadly excluded.',
          'ไข่ เต้าหู้ และนมไขมันต่ำเป็นทางเลือก ไม่จำเป็นต้องตัดโปรตีนพืชทั้งหมด',
        ),
        say(
          'Try tofu soup, a lightly cooked egg dish or plain low-fat yogurt.',
          'ลองแกงจืดเต้าหู้ ไข่ปรุงน้ำมันน้อย หรือโยเกิร์ตไขมันต่ำ',
        ),
      ],
      [
        say('Hydrate & lose weight gradually', 'ดื่มน้ำและลดน้ำหนักค่อยๆ'),
        say(
          'Drink regularly according to your needs. Avoid rapid weight loss and crash diets. Adjust fluids if your clinician advises a restriction.',
          'ดื่มสม่ำเสมอตามความต้องการ ไม่ลดน้ำหนักเร็วหรืออดอาหาร ปรับน้ำหากผู้ดูแลสุขภาพแนะนำให้จำกัด',
        ),
        say(
          'Small drinks through the day; no need for large volumes with meals.',
          'ดื่มทีละน้อยระหว่างวัน ไม่ต้องดื่มมากพร้อมมื้ออาหาร',
        ),
      ],
    ],
  },
])
</script>
<template>
  <div>
    <PageHeading
      :eyebrow="say('A LITTLE GUIDANCE', 'แนวทางเล็กๆ')"
      :title="say('Good food, fewer rules.', 'อาหารที่ดี โดยไม่ต้องมีกฎมากมาย')"
      :subtitle="
        say(
          'Practical principles to support all three of your goals. Make them work for real life.',
          'แนวทางที่ช่วยทั้งสามเป้าหมาย ปรับใช้ให้เข้ากับชีวิตจริง',
        )
      "
      ><NuxtLink to="/foods?checklist=1" class="primary-button"
        ><UIcon name="i-lucide-list-checks" />{{
          say('Check a meal', 'ทบทวนมื้ออาหาร')
        }}</NuxtLink
      ></PageHeading
    >
    <div class="rules-grid">
      <section
        v-for="group in groups"
        :key="group.title"
        class="panel rule-group"
      >
        <span class="action-icon" :class="group.color"
          ><UIcon :name="group.icon"
        /></span>
        <h2>{{ group.title }}</h2>
        <p>{{ group.intro }}</p>
        <details
          v-for="(rule, index) in group.rules"
          :key="rule[0]"
          :open="index === 0"
        >
          <summary>{{ rule[0] }}<UIcon name="i-lucide-chevron-down" /></summary>
          <p>{{ rule[1] }}</p>
          <div class="rule-example">
            <UIcon name="i-lucide-lightbulb" />{{ rule[2] }}
          </div>
        </details>
      </section>
    </div>
    <section class="panel sources-panel">
      <h2>
        {{
          say('Grounded in reliable guidance', 'อ้างอิงแนวทางที่เชื่อถือได้')
        }}
      </h2>
      <p>
        {{
          say(
            'This is an educational companion. Dietary needs and reflux triggers vary by person.',
            'นี่เป็นเครื่องมือเพื่อการเรียนรู้ ความต้องการอาหารและสิ่งกระตุ้นต่างกันในแต่ละคน',
          )
        }}
      </p>
      <a
        href="https://www.niddk.nih.gov/health-information/digestive-diseases/acid-reflux-ger-gerd-adults/eating-diet-nutrition"
        target="_blank"
        rel="noopener noreferrer"
        >NIDDK: Eating, diet & nutrition for GERD
        <UIcon name="i-lucide-arrow-up-right" /></a
      ><a
        href="https://www.wsh.nhs.uk/CMS-Documents/Patient-leaflets/NutritionandDieteticService/6753-1-Gout-and-diet.pdf"
        target="_blank"
        rel="noopener noreferrer"
        >NHS: Gout and diet <UIcon name="i-lucide-arrow-up-right"
      /></a>
    </section>
  </div>
</template>
