# Buddhist Quotes Dataset

**Version**: 1.0.0  
**Last Updated**: November 19, 2025  
**Total Quotes**: 75

## Overview

This dataset contains a curated collection of Buddhist wisdom quotes, Vietnamese proverbs (Tục ngữ), and Vietnamese folk songs (Ca dao), all with proper UTF-8 encoding to support Vietnamese diacritics.

## Dataset Breakdown

### By Category
- **Buddhist Quotes** (quote): 50 items
  - Vietnamese: 25 quotes (q001-q025)
  - English: 25 quotes (q026-q050)
- **Vietnamese Proverbs** (proverb): 15 items (p001-p015)
- **Vietnamese Ca Dao** (cadao): 10 items (c001-c010)

### By Language
- **Vietnamese (vi)**: 50 items
- **English (en)**: 25 items

### By Type/Theme
Buddhist quotes cover themes including:
- Wisdom (tuệ giác)
- Compassion (từ bi)
- Mindfulness (chánh niệm)
- Peace (an nhiên)
- Suffering (khổ đau)
- Impermanence (vô thường)
- Meditation (thiền định)
- Enlightenment (giác ngộ)

Vietnamese proverbs and ca dao cover:
- Relationships & friendship
- Perseverance & effort
- Education & learning
- Gratitude & respect
- Family & kinship
- Character & integrity
- Love & affection
- Wisdom & timing

## Authors Featured

### Buddhist Teachers
- **Đức Phật (Buddha)**: 44 quotes (Vietnamese & English)
- **Thích Nhất Hạnh**: 5 quotes (Vietnamese)
- **Dalai Lama**: 1 quote (English)

### Vietnamese Folk Wisdom
- **Tục ngữ Việt Nam** (Vietnamese Proverbs): 15 items
- **Ca dao Việt Nam** (Vietnamese Folk Songs): 10 items

## Data Schema

Each quote entry contains:
```json
{
  "id": "unique_identifier",
  "content": "quote text with UTF-8 support",
  "author": "author name",
  "category": "quote|proverb|cadao",
  "type": "theme/type",
  "language": "vi|en",
  "tags": ["tag1", "tag2", "tag3"]
}
```

## UTF-8 Support

All Vietnamese text includes proper diacritics:
- Vowels: à, á, ả, ã, ạ, ă, ằ, ắ, ẳ, ẵ, ặ, â, ầ, ấ, ẩ, ẫ, ậ, è, é, ẻ, ẽ, ẹ, ê, ề, ế, ể, ễ, ệ, ì, í, ỉ, ĩ, ị, ò, ó, ỏ, õ, ọ, ô, ồ, ố, ổ, ỗ, ộ, ơ, ờ, ớ, ở, ỡ, ợ, ù, ú, ủ, ũ, ụ, ư, ừ, ứ, ử, ữ, ự, ỳ, ý, ỷ, ỹ, ỵ
- Consonant: đ

File encoding: **UTF-8 without BOM**

## Search Tags

All quotes include searchable tags for enhanced filtering:
- Thematic tags (e.g., mindfulness, compassion, wisdom)
- Conceptual tags (e.g., present-moment, letting-go, self-love)
- Emotional tags (e.g., peace, joy, gratitude)
- Action tags (e.g., meditation, practice, giving)

## Usage

Load quotes via Angular HttpClient:
```typescript
this.http.get<Quote[]>('data/quotes.json')
  .subscribe(quotes => {
    // Process quotes
  });
```

## Future Expansion

This dataset can be expanded to include:
- More Buddhist sutras and teachings
- Quotes from other Buddhist traditions (Zen, Tibetan, Theravada)
- More Vietnamese folk wisdom
- Multilingual support (Chinese, Thai, Japanese)
- Additional metadata (source texts, context, related quotes)

Target for production: 500-1000 quotes for comprehensive coverage

## License

All Buddhist teachings are in the public domain. Vietnamese proverbs and ca dao are traditional folk wisdom in the public domain.

## Quality Assurance

✅ All quotes validated for:
- Unique IDs (no duplicates)
- Proper UTF-8 encoding
- Valid JSON structure
- Required fields present
- Meaningful categorization
- Searchable tags
- Character limits (content: <1000, author: <100)
