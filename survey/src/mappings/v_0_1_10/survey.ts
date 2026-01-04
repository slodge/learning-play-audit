// Survey content Copyright 2020 Learning through Landscapes https://www.ltl.org.uk/

// Update the version when any changes are made to the survey. Use semantic versioning.

import { BACKGROUND } from "../types/types";
import { SCALE_WITH_COMMENT, USER_TYPE_WITH_COMMENT, PERCENTAGE_TYPE_WITH_COMMENT, TEXT_AREA, TEXT_FIELD, TEXT_WITH_YEAR } from "../types/types";
import { QuestionType, Markup, Question, SubSection, Section } from "../types/types";


export const sectionsContent: Section[] = [
  {
    number: 1,
    title: "Background Information",
    id: BACKGROUND,
    subsections: [
      {
        questions: [
          { type: TEXT_FIELD, id: "school", text: "School" },
          { type: TEXT_FIELD, id: "localauthority", text: "Local Authority" },
          { type: TEXT_FIELD, id: "contactname", text: "Contact Name" },
          { type: USER_TYPE_WITH_COMMENT, id: "position", text: "Position" },
          { type: TEXT_FIELD, id: "telephone", text: "Telephone" },
        ],
      },
    ],
  },
  {
    number: 2,
    title: "Policy and Practice",
    id: "pandp",
    subsections: [
      {
        title: {
          tag: "p",
          content: "This section is for school staff to fill in. Please use a wide selection of staff across age groups and subject specialism, age, gender and experience.",
        },
        questions: [
          { type: SCALE_WITH_COMMENT, id: "P01", text: "Outdoor learning is an expectation of all our staff, who are trained and supported to deliver learning outdoors.", },
          { type: SCALE_WITH_COMMENT, id: "P02", text: "We have a member of staff or external supplier to deliver all or most of our outdoor learning themselves.", },
          { type: SCALE_WITH_COMMENT, id: "P03", text: "Sustainability, climate change or outdoor learning are all in addition to our current curriculum, or are enrichment, or are for the Eco-Committee to undertake.", },
          { type: SCALE_WITH_COMMENT, id: "P04", text: "Sustainability, climate change or outdoor learning is embedded across all the curriculum and is visible in school life.", },
          { type: SCALE_WITH_COMMENT, id: "P05", text: "All our break supervision staff are trained and feel confident to support great play in the school grounds.", },
          { type: SCALE_WITH_COMMENT, id: "P06", text: "We have an outdoor learning policy", },
          { type: SCALE_WITH_COMMENT, id: "P07", text: "We have a play policy", },
          { type: SCALE_WITH_COMMENT, id: "P08", text: "We have a climate change action and mitigation policy, or it is clearly integrated with other policies.", },
          { type: SCALE_WITH_COMMENT, id: "P09", text: "We have appointed a lead or co-ordinator in areas around climate change and sustainability in the curriculum, outdoor learning, and play.", },
          { type: SCALE_WITH_COMMENT, id: "P10", text: "All our pupils are actively involved in designing and creating school grounds improvements." },
          { type: SCALE_WITH_COMMENT, id: "P11", text: "A range of staff members, both teaching and non-teaching, are actively involved in designing and creating school grounds improvements." },
          { type: SCALE_WITH_COMMENT, id: "P12", text: "We relate our play, learning, and various action plans to the Global Goals for Sustainable Development." },
          { type: SCALE_WITH_COMMENT, id: "P13", text: "We are sharing our climate action work with parents and invite them to contribute their time and skills." },
          { type: SCALE_WITH_COMMENT, id: "P14", text: "We are sharing our outdoor learning and play work with parents and invite them to contribute in time, skills or donations as they can." },
          { type: SCALE_WITH_COMMENT, id: "P15", text: "Existing features in the school grounds are generally maintained, used and loved." },
          { type: SCALE_WITH_COMMENT, id: "P17", text: "We use the grounds for outdoor learning on a regular basis - most days someone is outside for a lesson." },
          { type: SCALE_WITH_COMMENT, id: "P18", text: "We have one or more sheltered outdoor gathering spaces for classes to use or pupils to socialise in." },
          { type: SCALE_WITH_COMMENT, id: "P19", text: "Our grounds are accessible by all pupils." },
          { type: SCALE_WITH_COMMENT, id: "P20", text: "We ensure that all pupils can access warm and waterproof outdoor clothing through a clothes library or similar." },
          { type: SCALE_WITH_COMMENT, id: "P21", text: "We partner with other organisations or individuals with specialist skills or knowledge to extend our outdoor learning and play." },
          { type: SCALE_WITH_COMMENT, id: "P22", text: "We partner with other organisations or individuals who have knowledge or expertise around climate change issues." },
          { type: SCALE_WITH_COMMENT, id: "P23", text: "Our grounds are used every break time, even in damp, hot, cold, or windy weather." },
          { type: SCALE_WITH_COMMENT, id: "P24", text: "We cancel our outdoor break times due to hot weather more than twice a year." },
          { type: SCALE_WITH_COMMENT, id: "P25", text: "We cancel our outdoor break times due to wet weather more than twice a year." },
          { type: SCALE_WITH_COMMENT, id: "P26", text: "We cancel our outdoor break time due to high winds more than twice a year." },
          { type: SCALE_WITH_COMMENT, id: "P27", text: "Our grounds are more sheltered from sun, wind, rain, or cold than the surrounding area." },
          { type: SCALE_WITH_COMMENT, id: "P28", text: "We welcome our children to play in the school grounds before and after school hours." },
          { type: SCALE_WITH_COMMENT, id: "P29", text: "The community use the space by arrangement in an evening or weekend (e.g. renting out pitches, birthday party hosting)." },
          { type: SCALE_WITH_COMMENT, id: "P30", text: "The community freely use the space in an evening or weekend for play and socialising." },
          { type: SCALE_WITH_COMMENT, id: "P31", text: "Our grounds are closed after school and not used by the community or our families out of hours." },
          { type: SCALE_WITH_COMMENT, id: "P32", text: "We have a plan to communicate to the wider school community around climate change education, outdoor learning and play." },
        ],
      },

    ],
  },
  {
    number: 3,
    title: "Nature and Sustainability",
    id: "nature",

    subsections: [
      {
        title: [
          { tag: "h2", content: "Ground Cover" },
          { tag: "p", content: "Using a satellite map, please estimate in percentages. Bing Maps offers the best detail in aerial photo mode. Use all areas of the school, not just where pupils have access, such as car parks.", },
        ],
        questions: [          
          { type: PERCENTAGE_TYPE_WITH_COMMENT, id: "GC01", text: "What area of grounds is covered by your buildings?", },
          { type: PERCENTAGE_TYPE_WITH_COMMENT, id: "GC02", text: "What area of grounds is sports or play surfaces such as artificial grass, rubber matting or clay pitches?", },
          { type: PERCENTAGE_TYPE_WITH_COMMENT, id: "GC03", text: "What area of grounds is solid / hard surfacing such as tarmac?", },
          { type: PERCENTAGE_TYPE_WITH_COMMENT, id: "GC04", text: "What area of grounds is mown grass e.g. sports pitches?", },
          { type: PERCENTAGE_TYPE_WITH_COMMENT, id: "GC05", text: "What area of grounds is for growing food or formal gardens?", },
          { type: PERCENTAGE_TYPE_WITH_COMMENT, id: "GC06", text: "What area of grounds is covered by trees, shrubs, or hedges?", },
          { type: PERCENTAGE_TYPE_WITH_COMMENT, id: "GC07", text: "What area of grounds is covered by long grass or meadow?", },
          { type: PERCENTAGE_TYPE_WITH_COMMENT, id: "GC08", text: "What area of grounds is covered by something else e.g. beach, bogland, water, stone?", },
        ],
      },
      {
        title: [
          { tag: "h2", content: "Biodiversity and Nature Features" },
        ],
        questions: [
          { type: SCALE_WITH_COMMENT, id: "N09", text: "We have items such as bug homes, bat boxes, or hedgehog homes." },
          { type: SCALE_WITH_COMMENT, id: "N10", text: "We have areas which are maintained as, or allowed to be, 'wild' with minimal or careful human access." },
          { type: SCALE_WITH_COMMENT, id: "N11", text: "We have water features such as ponds, streams or wetland." },
          { type: SCALE_WITH_COMMENT, id: "N12", text: "We have areas of flowers, wild flowers, flowering ground cover or flowering shrubs - which may or may not be actively encouraging pollinators." },
          { type: SCALE_WITH_COMMENT, id: "N13", text: "We have log piles or areas of deadwood to encourage insects." },
          { type: SCALE_WITH_COMMENT, id: "N14", text: "We encourage birdlife through providing bird boxes, tables and a source of water." },
          { type: SCALE_WITH_COMMENT, id: "N15", text: "Chemicals such as weedkillers, pesticides or herbicides are used on our site regularly." },
          { type: SCALE_WITH_COMMENT, id: "N16", text: "We have a biodiversity action plan for our site." },
        ],
      },

      {
        title: { tag: "h2", content: "Sustainability Features" },
        questions: [
          { type: SCALE_WITH_COMMENT, id: "SF01", text: "All the entrances used by all our children are welcoming, clearly signed and they encourage access by foot, scooter, bike or bus." },
          { type: SCALE_WITH_COMMENT, id: "SF02", text: "There is ample seating in different areas of the grounds, and for different sizes of group, including seating with shelter from heat, wind, or rain." },
          { type: SCALE_WITH_COMMENT, id: "SF03", text: "There is ample provision for secure cycle and scooter storage." },
          { type: SCALE_WITH_COMMENT, id: "SF04", text: "We have an active travel policy and action plan, which is shared with our local authority." },
          { type: SCALE_WITH_COMMENT, id: "SF06", text: "There are enough outdoor litter bins located in the right places." },
          { type: SCALE_WITH_COMMENT, id: "SF07", text: "We have renewable energy features of some kind, such as solar panels or a wind turbine." },
          { type: SCALE_WITH_COMMENT, id: "SF08", text: "There are good facilities for growing food in the grounds." },
          { type: SCALE_WITH_COMMENT, id: "SF09", text: "There are good gardening compost facilities." },
          { type: SCALE_WITH_COMMENT, id: "SF10", text: "There is a good range of fruit trees or bushes, and we use the fruit." },
          { type: SCALE_WITH_COMMENT, id: "SF11", text: "There are significant compromises on our site to allow vehicle access or car parking." },
        ],
      },
    ],
  },
  {
    number: 4,
    title: "Temperature Management",
    id: "temperature",
    subsections: [
      {
        title: [
          { tag: "p", content: "A warming planet puts more energy into our atmosphere. This extra energy is apparent in many ways - one way is that both the underlying temperature across the UK will increase and we will also see hotter and more sustained 'heat waves' in many parts of the UK." },
          { tag: "p", content: "Use this section to consider both how much your site could be  vulnerable to heat and how much your site can reduce the extreme heat. Some sites, which are dominated by buildings and dark, hard surfaces, perhaps facing south and in urban areas, are very vulnerable and heat should be a matter of urgent consideration and action." },
          { tag: "p", content: "The questions are looking at the whole site. You can use the notes to remind yourself where the hottest areas are or where they are shaded and cool regularly. You can also keep notes on ideas you have for some areas to use trees, shrubs, water, colour or wind to cool the area." },          
        ],	
        questions: [
          { type: SCALE_WITH_COMMENT, id: "T01", text: "We have areas of the grounds which get very hot in the summer, through being in the full sun." },
          { type: SCALE_WITH_COMMENT, id: "T02", text: "We have areas of the grounds which are well shaded by buildings through the summer." },
          { type: SCALE_WITH_COMMENT, id: "T03", text: "We have areas of the grounds which are well shaded by trees or shrubs through the summer." },
          { type: SCALE_WITH_COMMENT, id: "T04", text: "We have areas of the building which are shaded by trees or shrubs through the summer." },
          { type: SCALE_WITH_COMMENT, id: "T05", text: "The outdoor surfaces in our school can overheat and can be too hot to touch." },
          { type: SCALE_WITH_COMMENT, id: "T06", text: "Some of the indoor area of our building overheats in the summer, or requires air conditioning." },
          { type: SCALE_WITH_COMMENT, id: "T07", text: "We have green walls or green roofs on our buildings." },
          { type: SCALE_WITH_COMMENT, id: "T08", text: "We have running water in areas of our grounds, even in summer." },
          { type: SCALE_WITH_COMMENT, id: "T09", text: "We have or are planning temporary shades such as sun sails, tarps, or sheets we can put up in the summer." },
          { type: SCALE_WITH_COMMENT, id: "T10", text: "We have seating or gathering areas which are sheltered from the full sun and are cooler than surrounding areas in summer." },
          { type: SCALE_WITH_COMMENT, id: "T11", text: "We plan on planting trees, hedges, or shrubs in a location which will shelter the school grounds or building." },
        ],
      },

      {
        title: [
          { tag: "h2", content: "Cold Stress" },
          { tag: "p", content: "A warming planet puts more energy into our atmosphere. This extra energy is reflected in many ways - one way is greater variation in temperatures. Your site may now experience more 'cold events' in winter and a more persistent wind, cooling the site down." },
          { tag: "p", content: "The questions are looking at the whole site. You can use the notes to remind yourself where you can shelter from the wind and areas which remain colder for longer.",  },
        ],
        questions: [
          { type: SCALE_WITH_COMMENT, id: "T12", text: "We have areas of our grounds which feel colder than the rest of the site." },
          { type: SCALE_WITH_COMMENT, id: "T13", text: "We have areas of our site where frost or ice can sit for longer." },
          { type: SCALE_WITH_COMMENT, id: "T14", text: "We have areas of the grounds where frost, snow or ice rarely forms, even on a sub-zero temperature day." },
          { type: SCALE_WITH_COMMENT, id: "T15", text: "Some areas of our building struggle to stay warm on a cold day." },
          { type: SCALE_WITH_COMMENT, id: "T17", text: "We have seating or gathering areas which are more sheltered on a cold day." },
          { type: SCALE_WITH_COMMENT, id: "T18", text: "We plan on planting trees, hedges, or shrubs in a location which will shelter the school grounds or buildings." },
        ],
      },
      {
        title: [
          { tag: "h2", content: "Wind Stress" },
          {	tag: "p", content: "A warming planet puts more energy into our atmosphere. This extra energy is apparent in many ways - one way is increased winds around the planet. Your site may now experience more wind, both average wind days and extreme wind events during storms." },
          { tag: "p", content: "Use this section to consider both how much wind you have on your site and how much your site shelters you from the winds. You should consider the average wind on your site and extreme wind events due to storms.", },
          { tag: "p", content: "The questions are looking at the whole site. You can use the notes to remind yourself where sheltered areas are, where constantly windy areas are or where wind has or does cause problems." },
        ],
        questions: [
          { type: SCALE_WITH_COMMENT, id: "T19", text: "We have areas of the grounds which are windy on many days through the year." },
          { type: SCALE_WITH_COMMENT, id: "T20", text: "We have areas of the grounds which are usually sheltered from the wind." },
          { type: SCALE_WITH_COMMENT, id: "T21", text: "We have trees, shrubs or hedges planted around our boundaries." },
          { type: SCALE_WITH_COMMENT, id: "T22", text: "We have trees, shrubs, or hedges planted close to our building (within 5 metres)." },
          { type: SCALE_WITH_COMMENT, id: "T23", text: "We have had shrubs or trees damaged by winds within the last 5 years." },
          { type: SCALE_WITH_COMMENT, id: "T24", text: "Our buildings have been damaged by high winds within the last 5 years." },
          { type: SCALE_WITH_COMMENT, id: "T25", text: "We plan on planting trees, hedges, or shrubs in a location which will shelter the school grounds or building from wind." },
        ],
      },
    ],
  },
  {
    number: 5,
    title: "Water Management",
    id: "water",
    subsections: [
      {
        title: [
          { tag: "p", content: "A warming planet puts more energy into our atmosphere. This extra energy is apparent in many ways - one way is increased water in the atmosphere, which will increase both how often it rains and increase intense rain storms." },
          { tag: "p", content: "Use this section to consider how much water arrives at your site, how it is managed on site, and how it is released from your site. In the UK it is predicted that there is a significant issue depending on your local geography: the south and south east face long drought periods, the north and west face increases in the number of rainy days, and all areas face more rain storms and surface water flooding. All school sites should look to slow down the movement of water, retaining it for longer to reduce drought periods and also reduce any contribution to flooding down stream of the school site." },
          { tag: "p", content: "The questions are looking at the whole site. You can use the notes to remind yourself where issues are, and perhaps ideas to help manage water on site." },
        ],
        questions: [
          { type: SCALE_WITH_COMMENT, id: "WA01", text: "We have a stream or river, or have natural running water on site or on a boundary." },
          { type: SCALE_WITH_COMMENT, id: "WA02", text: "We have area(s) on which water puddles or pools (including a pond) when it rains, but it disappears slowly afterwards, and the water does not cause a problem for us." },
          { type: SCALE_WITH_COMMENT, id: "WA03", text: "We have areas of the school grounds which remain wet or muddy after rain, hindering use of some spaces." },
          { type: SCALE_WITH_COMMENT, id: "WA04", text: "Water floods or flows ONTO our site during rainfall from surrounding areas." },
          { type: SCALE_WITH_COMMENT, id: "WA05", text: "Water floods or flows OFF our site during rainfall into surrounding areas." },
          { type: SCALE_WITH_COMMENT, id: "WA06", text: "Some areas of our building have flooded during rainfall in the last 10 years." },
          { type: SCALE_WITH_COMMENT, id: "WA07", text: "Our downpipes from the school roof drain into rain gardens, water butts, swales, or similar." },
          { type: SCALE_WITH_COMMENT, id: "WA08", text: "Our site is in a flood risk area." },
          { type: SCALE_WITH_COMMENT, id: "WA10", text: "Our school has areas which are dry and dusty for more than a month in the summer." },
          { type: SCALE_WITH_COMMENT, id: "WA11", text: "We have plants or trees which have died, or are damaged, in the summer due to lack of water." },
          { type: SCALE_WITH_COMMENT, id: "WA12", text: "We have deep grass/meadow areas or mulch/gravel covered soil around our trees, shrubs, and plants." },
          { type: SCALE_WITH_COMMENT, id: "WA13", text: "We have a source of water other than mains water, to water our gardens or grounds with in the summer." },
          { type: SCALE_WITH_COMMENT, id: "WA14", text: "We have bog gardens, ponds, or swales which retain more water on our site, allowing it to slowly be used." },
          { type: SCALE_WITH_COMMENT, id: "WA15", text: "Our local area has hosepipe bans or other restrictions on water use during the summer." },
          { type: SCALE_WITH_COMMENT, id: "WA16", text: "We have a water management plan for our site." },
        ],
      },
    ],
  },
  {
    number: 6,
    title: "Carbon Management",
    id: "carbon",
    subsections: [
      {
        questions: [
          { type: SCALE_WITH_COMMENT, id: "C01", text: "There are a good number of trees of different species and ages in our grounds." },
          { type: SCALE_WITH_COMMENT, id: "C02", text: "There are a good number of shrubs of different species and ages in our grounds." },
          { type: SCALE_WITH_COMMENT, id: "C03", text: "There are areas of rough and long grass, meadows, or areas of wild plants which we do not mow regularly." },
          { type: SCALE_WITH_COMMENT, id: "C04", text: "There are a variety of hedges all around the school site, not just boundaries." },
          { type: SCALE_WITH_COMMENT, id: "C05", text: "We create our own compost on site - from landscape clippings, leaves etc." },
          { type: SCALE_WITH_COMMENT, id: "C06", text: "Our school grounds are over 70% hard surface such as tarmac, astro turf or rubber safety surfaces." },
          { type: SCALE_WITH_COMMENT, id: "C07", text: "We have an action plan to increase trees, shrubs, long grass, meadows, and hedges around our site, as a way of sequestering carbon" },
        ],
      },
    ],
  },
  {
    number: 7,
    title: "Air Quality",
    id: "air",
    subsections: [
      {
        questions: [
          { type: SCALE_WITH_COMMENT, id: "A01", text: "We have plants, shrubs, hedges, or trees immediately next to sources of pollution (e.g. on the verge next to a road, but outside the school site)." },
          { type: SCALE_WITH_COMMENT, id: "A02", text: "We have barriers such as a hedge or shrubs on the boundary, which could help block out sources of pollution next to the site." },
          { type: SCALE_WITH_COMMENT, id: "A03", text: "We have sources of pollution on our site and below adult head height - such as a boiler flue." },
          { type: SCALE_WITH_COMMENT, id: "A04", text: "We have more trees, shrubs, and hedges around the site, but not on the boundary." },
          { type: SCALE_WITH_COMMENT, id: "A05", text: "We are next to significant sources of pollution from traffic - such as a busy road or intersection." },
          { type: SCALE_WITH_COMMENT, id: "A07", text: "We have an air quality plan which both reduces our school sources of air pollution, and/or which includes a planting scheme to reduce the pollution which gets onto our site." },
        ],
      },
    ],
  },
];


