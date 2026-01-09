const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
        HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
        LevelFormat, PageBreak } = require('docx');
const fs = require('fs');

// Border styles
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

// Priority cell shading
const priorityColors = {
  critical: "FFEBEE",  // Red
  high: "FFF3E0",      // Orange  
  medium: "E3F2FD",    // Blue
  low: "F3E5F5"        // Purple
};

const improvements = [
  {
    priority: 1,
    title: "Mobile Search Experience",
    problem: "Search icon links to /shop page instead of providing instant search. Users must navigate away to search.",
    friction: "High - 40% of luxury shoppers use mobile. Forcing page navigation breaks flow.",
    solution: "Add search modal with autocomplete, recent searches, and trending items. Implement fuzzy search for brand/product names.",
    roi: "Critical",
    effort: "3-5 days",
    metrics: "Search usage +300%, session duration +25%"
  },
  {
    priority: 2,
    title: "Wishlist / Save for Later",
    problem: "Heart buttons are non-functional (TODO comments). Luxury purchases often involve consideration periods.",
    friction: "Critical - Luxury items require research. Without wishlists, users lose track of items.",
    solution: "Implement wishlist with localStorage for guests, database for users. Add price drop notifications and share functionality.",
    roi: "Critical", 
    effort: "4-6 days",
    metrics: "Return visit rate +40%, conversion +15%"
  },
  {
    priority: 3,
    title: "Social Sharing for Viral Growth",
    problem: "No way to share products on social media. Luxury items are highly shareable content.",
    friction: "High - Missing viral loop. Users cannot share finds or ask friends for opinions.",
    solution: "Add share sheet (iMessage, WhatsApp, Instagram, Pinterest, copy link). Include referral tracking for attribution.",
    roi: "Critical",
    effort: "2-3 days",
    metrics: "Viral coefficient 0.3+, CAC reduction 20%"
  },
  {
    priority: 4,
    title: "Quick View Modal",
    problem: "Users must click through to product detail page to see any details beyond thumbnail.",
    friction: "Medium - Adds friction to browsing. Users want to quickly assess items.",
    solution: "Add quick view modal on product cards showing images, price, condition, and Add to Cart. Swipeable on mobile.",
    roi: "High",
    effort: "3-4 days",
    metrics: "Products viewed per session +60%, add to cart +20%"
  },
  {
    priority: 5,
    title: "Social Proof on Product Cards",
    problem: "Product cards show no reviews or ratings. Trust is critical for luxury consignment.",
    friction: "High - Users can't assess seller/product quality at browse stage.",
    solution: "Add star rating, review count, and 'Covet Certified' badge prominently. Show store rating for third-party sellers.",
    roi: "High",
    effort: "2-3 days",
    metrics: "CTR on product cards +35%, conversion +12%"
  },
  {
    priority: 6,
    title: "Address Autocomplete",
    problem: "Manual address entry at checkout. High-value customers expect premium UX.",
    friction: "Medium - Address entry errors cause shipping issues and cart abandonment.",
    solution: "Integrate Google Places or Smarty Streets API. Auto-fill city/state from ZIP. Save addresses for returning users.",
    roi: "High",
    effort: "2-3 days", 
    metrics: "Checkout completion +8%, support tickets -30%"
  },
  {
    priority: 7,
    title: "Social Login",
    problem: "Only email/password registration. Higher friction for new users.",
    friction: "Medium - Each field is a drop-off point. Social login reduces friction 70%.",
    solution: "Add Google and Apple Sign-In. Auto-populate profile from social data. Maintain email fallback.",
    roi: "High",
    effort: "3-4 days",
    metrics: "Registration completion +45%, time to first purchase -2 days"
  },
  {
    priority: 8,
    title: "Price Drop Alerts",
    problem: "No way to track price changes on items. Users may wait for better deals.",
    friction: "Medium - Users leave and don't return. Competition may offer alerts.",
    solution: "Allow users to set price alerts on wishlist items. Send push/email when price drops. Show 'X users watching' for urgency.",
    roi: "Medium",
    effort: "4-5 days",
    metrics: "Email engagement +50%, dormant user reactivation +25%"
  },
  {
    priority: 9,
    title: "Mobile Filter UX Improvements",
    problem: "Filter drawer covers entire screen, losing context of products.",
    friction: "Low-Medium - Users can't see how filters affect results in real-time.",
    solution: "Use bottom sheet that shows result count live. Add 'X results' badge. Allow horizontal scroll chips for quick filter toggles.",
    roi: "Medium",
    effort: "2-3 days",
    metrics: "Filter usage +40%, bounce rate -10%"
  },
  {
    priority: 10,
    title: "Seller Application Progress Indicators",
    problem: "3-step seller application has no visible progress. Users may abandon mid-flow.",
    friction: "Medium - Long forms feel endless without progress indication.",
    solution: "Add step indicator with labels. Show estimated time remaining. Allow save draft functionality.",
    roi: "Medium",
    effort: "1-2 days",
    metrics: "Application completion +20%, quality of applications +15%"
  }
];

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 24 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 40, bold: true, font: "Arial", color: "1A1A1A" },
        paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: "333333" },
        paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: "444444" },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [
      // Title
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("Covet UX Analysis & Recommendations")]
      }),
      
      // Subtitle
      new Paragraph({
        spacing: { after: 400 },
        children: [
          new TextRun({ text: "10 High-Leverage UX Improvements for Mobile-First Viral Adoption", italics: true, size: 22, color: "666666" })
        ]
      }),
      
      // Executive Summary
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Executive Summary")]
      }),
      
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun("Covet is a luxury consignment marketplace with strong foundations: clean design, trust-focused messaging, and a well-structured seller flow. However, several critical friction points limit mobile engagement and viral growth potential. This analysis identifies 10 high-ROI improvements prioritized by impact on conversion and viral coefficient.")
        ]
      }),

      // Current State Summary
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Current State Assessment")]
      }),
      
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({ text: "Strengths:", bold: true })]
      }),
      
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Clean, luxury-appropriate visual design with consistent brand identity")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Strong trust signals (Covet Certified badges, authentication messaging)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Well-structured multi-step seller application flow")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Responsive mobile layout with filter drawer implementation")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 200 },
        children: [new TextRun("Proper loading states and error handling throughout")]
      }),

      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({ text: "Critical Gaps:", bold: true })]
      }),
      
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("No functional wishlist (heart buttons are TODO placeholders)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Missing social sharing capabilities (zero viral loop)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Search icon navigates away instead of providing instant search")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("No social proof on product cards (reviews/ratings hidden)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 400 },
        children: [new TextRun("Registration limited to email/password only")]
      }),

      // Priority Table Header
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Prioritized Recommendations")]
      }),
      
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun("Improvements ranked by ROI (Impact × Ease of Implementation):")]
      }),

      // Priority Summary Table
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths: [800, 4500, 1500, 1300, 1260],
        rows: [
          // Header row
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 800, type: WidthType.DXA },
                shading: { fill: "1A1A1A", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "#", bold: true, color: "FFFFFF" })] })]
              }),
              new TableCell({
                borders,
                width: { size: 4500, type: WidthType.DXA },
                shading: { fill: "1A1A1A", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Improvement", bold: true, color: "FFFFFF" })] })]
              }),
              new TableCell({
                borders,
                width: { size: 1500, type: WidthType.DXA },
                shading: { fill: "1A1A1A", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "ROI", bold: true, color: "FFFFFF" })] })]
              }),
              new TableCell({
                borders,
                width: { size: 1300, type: WidthType.DXA },
                shading: { fill: "1A1A1A", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Effort", bold: true, color: "FFFFFF" })] })]
              }),
              new TableCell({
                borders,
                width: { size: 1260, type: WidthType.DXA },
                shading: { fill: "1A1A1A", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Key Metric", bold: true, color: "FFFFFF" })] })]
              }),
            ]
          }),
          // Data rows
          ...improvements.map((imp, idx) => {
            const roiColor = imp.roi === "Critical" ? priorityColors.critical : 
                            imp.roi === "High" ? priorityColors.high : priorityColors.medium;
            return new TableRow({
              children: [
                new TableCell({
                  borders,
                  width: { size: 800, type: WidthType.DXA },
                  shading: { fill: roiColor, type: ShadingType.CLEAR },
                  margins: { top: 80, bottom: 80, left: 120, right: 120 },
                  children: [new Paragraph({ children: [new TextRun({ text: String(imp.priority), bold: true })] })]
                }),
                new TableCell({
                  borders,
                  width: { size: 4500, type: WidthType.DXA },
                  shading: { fill: roiColor, type: ShadingType.CLEAR },
                  margins: { top: 80, bottom: 80, left: 120, right: 120 },
                  children: [new Paragraph({ children: [new TextRun(imp.title)] })]
                }),
                new TableCell({
                  borders,
                  width: { size: 1500, type: WidthType.DXA },
                  shading: { fill: roiColor, type: ShadingType.CLEAR },
                  margins: { top: 80, bottom: 80, left: 120, right: 120 },
                  children: [new Paragraph({ children: [new TextRun({ text: imp.roi, bold: true })] })]
                }),
                new TableCell({
                  borders,
                  width: { size: 1300, type: WidthType.DXA },
                  shading: { fill: roiColor, type: ShadingType.CLEAR },
                  margins: { top: 80, bottom: 80, left: 120, right: 120 },
                  children: [new Paragraph({ children: [new TextRun(imp.effort)] })]
                }),
                new TableCell({
                  borders,
                  width: { size: 1260, type: WidthType.DXA },
                  shading: { fill: roiColor, type: ShadingType.CLEAR },
                  margins: { top: 80, bottom: 80, left: 120, right: 120 },
                  children: [new Paragraph({ children: [new TextRun({ text: imp.metrics.split(",")[0], size: 20 })] })]
                }),
              ]
            });
          })
        ]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // Detailed Recommendations
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Detailed Recommendations")]
      }),

      // Generate detailed sections for each improvement
      ...improvements.flatMap((imp, idx) => [
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          children: [new TextRun(`${imp.priority}. ${imp.title}`)]
        }),
        
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({ text: "Problem: ", bold: true }),
            new TextRun(imp.problem)
          ]
        }),
        
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({ text: "Friction Level: ", bold: true }),
            new TextRun(imp.friction)
          ]
        }),
        
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({ text: "Solution: ", bold: true }),
            new TextRun(imp.solution)
          ]
        }),
        
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({ text: "Expected Impact: ", bold: true }),
            new TextRun(imp.metrics)
          ]
        }),
        
        // Add page break after item 5
        ...(idx === 4 ? [new Paragraph({ children: [new PageBreak()] })] : [])
      ]),

      new Paragraph({ children: [new PageBreak()] }),

      // Implementation Phases
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Implementation Roadmap")]
      }),

      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({ text: "Phase 1: Quick Wins (Week 1-2)", bold: true, color: "D32F2F" })]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Social sharing buttons on product pages")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Seller application progress indicators")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 200 },
        children: [new TextRun("Social proof badges on product cards")]
      }),

      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({ text: "Phase 2: Core Features (Week 3-4)", bold: true, color: "E65100" })]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Mobile search modal with autocomplete")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Wishlist functionality with localStorage + database")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 200 },
        children: [new TextRun("Quick view modal on product cards")]
      }),

      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({ text: "Phase 3: Growth Features (Week 5-6)", bold: true, color: "1976D2" })]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Social login (Google + Apple)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Address autocomplete at checkout")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 200 },
        children: [new TextRun("Mobile filter UX improvements")]
      }),

      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({ text: "Phase 4: Engagement (Week 7-8)", bold: true, color: "7B1FA2" })]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Price drop alerts system")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Referral tracking integration")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 400 },
        children: [new TextRun("Push notification infrastructure")]
      }),

      // Success Metrics
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Success Metrics to Track")]
      }),

      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths: [3120, 3120, 3120],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 3120, type: WidthType.DXA },
                shading: { fill: "E8F5E9", type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 120, right: 120 },
                children: [
                  new Paragraph({ children: [new TextRun({ text: "Engagement", bold: true })] }),
                  new Paragraph({ children: [new TextRun({ text: "Session duration", size: 20 })] }),
                  new Paragraph({ children: [new TextRun({ text: "Products viewed/session", size: 20 })] }),
                  new Paragraph({ children: [new TextRun({ text: "Search usage rate", size: 20 })] }),
                  new Paragraph({ children: [new TextRun({ text: "Filter usage rate", size: 20 })] }),
                ]
              }),
              new TableCell({
                borders,
                width: { size: 3120, type: WidthType.DXA },
                shading: { fill: "E3F2FD", type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 120, right: 120 },
                children: [
                  new Paragraph({ children: [new TextRun({ text: "Conversion", bold: true })] }),
                  new Paragraph({ children: [new TextRun({ text: "Add-to-cart rate", size: 20 })] }),
                  new Paragraph({ children: [new TextRun({ text: "Checkout completion", size: 20 })] }),
                  new Paragraph({ children: [new TextRun({ text: "Registration rate", size: 20 })] }),
                  new Paragraph({ children: [new TextRun({ text: "Seller application rate", size: 20 })] }),
                ]
              }),
              new TableCell({
                borders,
                width: { size: 3120, type: WidthType.DXA },
                shading: { fill: "FFF3E0", type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 120, right: 120 },
                children: [
                  new Paragraph({ children: [new TextRun({ text: "Growth", bold: true })] }),
                  new Paragraph({ children: [new TextRun({ text: "Viral coefficient", size: 20 })] }),
                  new Paragraph({ children: [new TextRun({ text: "Referral conversions", size: 20 })] }),
                  new Paragraph({ children: [new TextRun({ text: "Social shares/day", size: 20 })] }),
                  new Paragraph({ children: [new TextRun({ text: "Return visitor rate", size: 20 })] }),
                ]
              }),
            ]
          })
        ]
      }),

      new Paragraph({
        spacing: { before: 400 },
        children: [
          new TextRun({ text: "Document prepared: ", color: "888888" }),
          new TextRun({ text: new Date().toLocaleDateString(), color: "888888" })
        ]
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/mnt/user-data/outputs/covet-ux-analysis.docx", buffer);
  console.log("Document created successfully!");
});
