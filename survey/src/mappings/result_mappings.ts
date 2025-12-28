export type SectionAndQuestionPair = {
  section: string,
  question: string,
}

export type ResultMapping = {
  A: SectionAndQuestionPair[],
  B: SectionAndQuestionPair[],
}

export type AllResultMappings = {
  [key: string]: ResultMapping,
}

export const result_mappings: AllResultMappings = {
  "Culture: Vision & Values": {
    "A": [
      {
        "section": "pandp",
        "question": "P01"
      },
      {
        "section": "pandp",
        "question": "P04"
      },
      {
        "section": "pandp",
        "question": "P05"
      },
      {
        "section": "pandp",
        "question": "P09"
      },
      {
        "section": "pandp",
        "question": "P11"
      }
    ],
    "B": [
      {
        "section": "pandp",
        "question": "P02"
      }
    ]
  },
  "Culture: Ambition": {
    "A": [
      {
        "section": "pandp",
        "question": "P01"
      },
      {
        "section": "pandp",
        "question": "P04"
      },
      {
        "section": "pandp",
        "question": "P32"
      },
      {
        "section": "temperature",
        "question": "T11"
      },
      {
        "section": "temperature",
        "question": "T18"
      },
      {
        "section": "temperature",
        "question": "T25"
      }
    ],
    "B": []
  },
  "Culture: Policy & Practice": {
    "A": [
      {
        "section": "pandp",
        "question": "P01"
      },
      {
        "section": "pandp",
        "question": "P04"
      },
      {
        "section": "pandp",
        "question": "P05"
      },
      {
        "section": "pandp",
        "question": "P06"
      },
      {
        "section": "pandp",
        "question": "P07"
      },
      {
        "section": "pandp",
        "question": "P08"
      },
      {
        "section": "pandp",
        "question": "P09"
      },
      {
        "section": "pandp",
        "question": "P10"
      },
      {
        "section": "pandp",
        "question": "P11"
      },
      {
        "section": "pandp",
        "question": "P12"
      },
      {
        "section": "pandp",
        "question": "P13"
      },
      {
        "section": "pandp",
        "question": "P14"
      },
      {
        "section": "pandp",
        "question": "P15"
      },
      {
        "section": "pandp",
        "question": "P17"
      },
      {
        "section": "pandp",
        "question": "P18"
      },
      {
        "section": "pandp",
        "question": "P19"
      },
      {
        "section": "pandp",
        "question": "P20"
      },
      {
        "section": "pandp",
        "question": "P21"
      },
      {
        "section": "pandp",
        "question": "P22"
      },
      {
        "section": "pandp",
        "question": "P23"
      },
      {
        "section": "pandp",
        "question": "P27"
      },
      {
        "section": "pandp",
        "question": "P28"
      },
      {
        "section": "pandp",
        "question": "P29"
      },
      {
        "section": "pandp",
        "question": "P30"
      },
      {
        "section": "pandp",
        "question": "P32"
      },
      {
        "section": "nature",
        "question": "N16"
      },
      {
        "section": "water",
        "question": "WA16"
      },
      {
        "section": "carbon",
        "question": "C07"
      }
    ],
    "B": [
      {
        "section": "pandp",
        "question": "P02"
      },
      {
        "section": "pandp",
        "question": "P03"
      },
      {
        "section": "pandp",
        "question": "P24"
      },
      {
        "section": "pandp",
        "question": "P25"
      },
      {
        "section": "pandp",
        "question": "P26"
      },
      {
        "section": "pandp",
        "question": "P31"
      },
      {
        "section": "nature",
        "question": "SF11"
      }
    ]
  },
  "Culture: Sustainability features": {
    "A": [
      {
        "section": "nature",
        "question": "SF01"
      },
      {
        "section": "nature",
        "question": "SF02"
      },
      {
        "section": "nature",
        "question": "SF03"
      },
      {
        "section": "nature",
        "question": "SF04"
      },
      {
        "section": "nature",
        "question": "SF06"
      },
      {
        "section": "nature",
        "question": "SF07"
      },
      {
        "section": "nature",
        "question": "SF08"
      },
      {
        "section": "nature",
        "question": "SF09"
      },
      {
        "section": "nature",
        "question": "SF10"
      }
    ],
    "B": []
  },
  "Culture: Inclusion": {
    "A": [
      {
        "section": "pandp",
        "question": "P04"
      },
      {
        "section": "pandp",
        "question": "P05"
      },
      {
        "section": "pandp",
        "question": "P10"
      },
      {
        "section": "pandp",
        "question": "P11"
      },
      {
        "section": "pandp",
        "question": "P13"
      },
      {
        "section": "pandp",
        "question": "P14"
      },
      {
        "section": "pandp",
        "question": "P20"
      }
    ],
    "B": [
      {
        "section": "pandp",
        "question": "P31"
      }
    ]
  },
  "Curriculum: Climate Change & Sustainability Education": {
    "A": [
      {
        "section": "pandp",
        "question": "P01"
      },
      {
        "section": "pandp",
        "question": "P04"
      },
      {
        "section": "pandp",
        "question": "P10"
      },
      {
        "section": "pandp",
        "question": "P12"
      },
      {
        "section": "nature",
        "question": "SF08"
      }
    ],
    "B": [
      {
        "section": "pandp",
        "question": "P02"
      },
      {
        "section": "pandp",
        "question": "P03"
      }
    ]
  },
  "Curriculum: Play": {
    "A": [
      {
        "section": "pandp",
        "question": "P05"
      },
      {
        "section": "pandp",
        "question": "P27"
      },
      {
        "section": "pandp",
        "question": "P28"
      },
      {
        "section": "pandp",
        "question": "P30"
      }
    ],
    "B": [
      {
        "section": "pandp",
        "question": "P24"
      },
      {
        "section": "pandp",
        "question": "P25"
      },
      {
        "section": "pandp",
        "question": "P26"
      },
      {
        "section": "pandp",
        "question": "P31"
      }
    ]
  },
  "Campus: Features for learning and play": {
    "A": [
      {
        "section": "pandp",
        "question": "P15"
      },
      {
        "section": "pandp",
        "question": "P17"
      },
      {
        "section": "pandp",
        "question": "P18"
      },
      {
        "section": "pandp",
        "question": "P19"
      },
      {
        "section": "pandp",
        "question": "P27"
      }
    ],
    "B": [
      {
        "section": "pandp",
        "question": "P31"
      },
      {
        "section": "carbon",
        "question": "C06"
      }
    ]
  },
  "Campus: Nature": {
    "A": [
      {
        "section": "nature",
        "question": "N09"
      },
      {
        "section": "nature",
        "question": "N10"
      },
      {
        "section": "nature",
        "question": "N11"
      },
      {
        "section": "nature",
        "question": "N12"
      },
      {
        "section": "nature",
        "question": "N13"
      },
      {
        "section": "nature",
        "question": "N14"
      },
      {
        "section": "nature",
        "question": "N16"
      },
      {
        "section": "nature",
        "question": "SF08"
      },
      {
        "section": "nature",
        "question": "SF10"
      },
      {
        "section": "water",
        "question": "WA01"
      },
      {
        "section": "water",
        "question": "WA02"
      },
      {
        "section": "carbon",
        "question": "C01"
      },
      {
        "section": "carbon",
        "question": "C02"
      },
      {
        "section": "carbon",
        "question": "C03"
      },
      {
        "section": "carbon",
        "question": "C04"
      },
      {
        "section": "carbon",
        "question": "C05"
      },
      {
        "section": "carbon",
        "question": "C07"
      }
    ],
    "B": [
      {
        "section": "nature",
        "question": "N15"
      },
      {
        "section": "carbon",
        "question": "C06"
      }
    ]
  },
  "Campus: Wind": {
    "A": [
      {
        "section": "temperature",
        "question": "T20"
      },
      {
        "section": "temperature",
        "question": "T21"
      },
      {
        "section": "temperature",
        "question": "T22"
      },
      {
        "section": "temperature",
        "question": "T25"
      }
    ],
    "B": [
      {
        "section": "temperature",
        "question": "T19"
      },
      {
        "section": "temperature",
        "question": "T23"
      },
      {
        "section": "temperature",
        "question": "T24"
      }
    ]
  },
  "Campus: Heat": {
    "A": [
      {
        "section": "temperature",
        "question": "T02"
      },
      {
        "section": "temperature",
        "question": "T03"
      },
      {
        "section": "temperature",
        "question": "T04"
      },
      {
        "section": "temperature",
        "question": "T07"
      },
      {
        "section": "temperature",
        "question": "T08"
      },
      {
        "section": "temperature",
        "question": "T09"
      },
      {
        "section": "temperature",
        "question": "T10"
      },
      {
        "section": "temperature",
        "question": "T11"
      }
    ],
    "B": [
      {
        "section": "temperature",
        "question": "T01"
      },
      {
        "section": "temperature",
        "question": "T05"
      },
      {
        "section": "temperature",
        "question": "T06"
      },
      {
        "section": "carbon",
        "question": "C06"
      }
    ]
  },
  "Campus: Cold": {
    "A": [
      {
        "section": "temperature",
        "question": "T14"
      },
      {
        "section": "temperature",
        "question": "T17"
      },
      {
        "section": "temperature",
        "question": "T18"
      }
    ],
    "B": [
      {
        "section": "temperature",
        "question": "T12"
      },
      {
        "section": "temperature",
        "question": "T13"
      },
      {
        "section": "temperature",
        "question": "T15"
      },
      {
        "section": "carbon",
        "question": "C06"
      }
    ]
  },
  "Campus: Excess Water": {
    "A": [
      {
        "section": "water",
        "question": "WA01"
      },
      {
        "section": "water",
        "question": "WA02"
      },
      {
        "section": "water",
        "question": "WA07"
      },
      {
        "section": "water",
        "question": "WA16"
      }
    ],
    "B": [
      {
        "section": "water",
        "question": "WA03"
      },
      {
        "section": "water",
        "question": "WA04"
      },
      {
        "section": "water",
        "question": "WA05"
      },
      {
        "section": "water",
        "question": "WA06"
      },
      {
        "section": "water",
        "question": "WA08"
      },
      {
        "section": "carbon",
        "question": "C06"
      }
    ]
  },
  "Campus: Drought": {
    "A": [
      {
        "section": "water",
        "question": "WA12"
      },
      {
        "section": "water",
        "question": "WA13"
      },
      {
        "section": "water",
        "question": "WA14"
      },
      {
        "section": "water",
        "question": "WA16"
      }
    ],
    "B": [
      {
        "section": "water",
        "question": "WA10"
      },
      {
        "section": "water",
        "question": "WA11"
      },
      {
        "section": "water",
        "question": "WA15"
      },
      {
        "section": "carbon",
        "question": "C06"
      }
    ]
  },
  "Campus: Carbon Management": {
    "A": [
      {
        "section": "carbon",
        "question": "C01"
      },
      {
        "section": "carbon",
        "question": "C02"
      },
      {
        "section": "carbon",
        "question": "C03"
      },
      {
        "section": "carbon",
        "question": "C04"
      },
      {
        "section": "carbon",
        "question": "C05"
      },
      {
        "section": "carbon",
        "question": "C07"
      }
    ],
    "B": [
      {
        "section": "carbon",
        "question": "C06"
      }
    ]
  },
  "Campus: Air Quality": {
    "A": [
      {
        "section": "air",
        "question": "A01"
      },
      {
        "section": "air",
        "question": "A02"
      },
      {
        "section": "air",
        "question": "A04"
      },
      {
        "section": "air",
        "question": "A07"
      }
    ],
    "B": [
      {
        "section": "air",
        "question": "A03"
      },
      {
        "section": "air",
        "question": "A05"
      }
    ]
  },
  "Community: Involvement": {
    "A": [
      {
        "section": "pandp",
        "question": "P13"
      },
      {
        "section": "pandp",
        "question": "P14"
      },
      {
        "section": "pandp",
        "question": "P28"
      },
      {
        "section": "pandp",
        "question": "P29"
      },
      {
        "section": "pandp",
        "question": "P30"
      },
      {
        "section": "nature",
        "question": "SF01"
      },
      {
        "section": "nature",
        "question": "SF04"
      }
    ],
    "B": [
      {
        "section": "pandp",
        "question": "P31"
      }
    ]
  },
  "Community: Partnerships with specialists": {
    "A": [
      {
        "section": "pandp",
        "question": "P21"
      },
      {
        "section": "pandp",
        "question": "P22"
      }
    ],
    "B": [
      {
        "section": "pandp",
        "question": "P02"
      },
      {
        "section": "pandp",
        "question": "P03"
      }
    ]
  }
}