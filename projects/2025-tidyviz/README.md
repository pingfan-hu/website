# TidyViz

[![PyPI version](https://badge.fury.io/py/tidyviz.svg)](https://badge.fury.io/py/tidyviz)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://pepy.tech/badge/tidyviz)](https://pepy.tech/project/tidyviz)

A Python package for survey data cleaning and visualization.

## Features

**Data Cleaning**
- Expand/collapse multiple choice responses
- Validate response ranges
- Detect missing data patterns
- Flag straight-lining and speeders
- Check logical consistency

**Visualization**
- Single choice bar charts
- Multiple choice bar charts
- Custom color palettes
- Survey-appropriate styling

## Installation

Install from [PyPI](https://pypi.org/project/tidyviz/):

```bash
pip install tidyviz
```

Development installation:
```bash
git clone https://github.com/pingfan-hu/tidyviz.git
cd tidyviz
pip install -e ".[dev]"
```

## Quick Start

```python
import pandas as pd
import tidyviz as tv

# Load survey data
df = pd.read_csv('survey.csv')

# Clean: Expand multiple choice column
df_expanded = tv.tidy.expand_multiple_choice(df, 'colors')

# Validate: Check response ranges
df_clean, invalid = tv.tidy.check_response_range(
    df, 'satisfaction', min_val=1, max_val=5
)

# Visualize: Plot single choice responses
tv.viz.set_survey_style(palette='categorical')
tv.viz.plot_single_choice(df, 'contact_method',
                          title='Preferred Contact',
                          show_percentages=True)
```

## Documentation

### Data Cleaning (`tv.tidy`)

**Multiple Choice Handling**
```python
# Expand comma-separated values to binary columns
df_exp = tv.tidy.expand_multiple_choice(df, 'colors', sep=',')
# Creates: colors_Red, colors_Blue, colors_Green...

# Collapse binary columns back to comma-separated
df_col = tv.tidy.collapse_multiple_choice(df_exp, 'colors')
```

**Response Validation**
```python
# Flag invalid responses
df, invalid_mask = tv.tidy.check_response_range(
    df, 'rating', min_val=1, max_val=5,
    handle_invalid='flag'
)

# Remove invalid responses
df_clean, _ = tv.tidy.check_response_range(
    df, 'rating', min_val=1, max_val=5,
    handle_invalid='remove'
)
```

**Data Quality Checks**
```python
# Detect missing data patterns
info = tv.tidy.detect_missing_patterns(df)
# Returns: complete_rows, rows_with_missing, missing_rates

# Flag straight-liners (same response across questions)
flags = tv.tidy.flag_straight_liners(df, ['Q1', 'Q2', 'Q3'])

# Detect speeders (unusually fast completion)
flags = tv.tidy.detect_speeders(df, 'completion_time',
                                 method='iqr')

# Check logical consistency
rules = [{
    'name': 'age_check',
    'condition': lambda row: row['age'] >= 18
}]
df = tv.tidy.check_logical_consistency(df, rules)
```

### Visualization (`tv.viz`)

**Single Choice Questions**
```python
# Basic bar chart
tv.viz.plot_single_choice(df, 'method')

# With customization
tv.viz.plot_single_choice(
    df, 'method',
    title='Preferred Method',
    show_percentages=True,
    sort_by='count',  # or 'name'
    color_palette='sequential'
)
```

**Multiple Choice Questions**
```python
# First expand the data
df_exp = tv.tidy.expand_multiple_choice(df, 'colors')
color_cols = [c for c in df_exp.columns if c.startswith('colors_')]

# Plot multiple choice
tv.viz.plot_multiple_choice(
    df_exp, color_cols,
    title='Favorite Colors',
    show_percentages=True,
    sort_by='count'
)
```

**Styling**
```python
# Set global style
tv.viz.set_survey_style(
    style='default',  # or 'minimal', 'presentation'
    palette='categorical'  # or 'sequential', 'Set2', etc.
)

# Get color palette
colors = tv.viz.get_palette('categorical', n_colors=5)
```

## Examples

See the [`examples/`](examples/) directory for complete workflows:
- [`example_tidy.py`](examples/example_tidy.py) - Data cleaning pipeline
- [`example_viz.py`](examples/example_viz.py) - Visualization examples

## Documentation

📚 **[Complete Documentation](docs/)** - Full guides and API reference

- **[API Reference](docs/API.md)** - Detailed function documentation with parameters and examples
- **[User Guide](docs/USER_GUIDE.md)** - Comprehensive tutorials and workflows
- **[Quick Reference](docs/QUICK_REFERENCE.md)** - Concise syntax cheat sheet

## Requirements

- Python ≥ 3.8
- pandas ≥ 1.3.0
- numpy ≥ 1.20.0
- matplotlib ≥ 3.4.0
- seaborn ≥ 0.11.0

## Development

```bash
# Run tests
pytest

# Format code
black src/ tests/

# Lint code
flake8 src/ tests/

# Build package
python -m build
```

## Author

**Pingfan Hu**
- Website: [https://pingfanhu.com](https://pingfanhu.com)
- GitHub: [@pingfan-hu](https://github.com/pingfan-hu)
- Email: pingfan0727@gmail.com

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## Citation

```bibtex
@software{tidyviz2025,
  title = {TidyViz: Survey Data Analysis for Python},
  author = {Hu, Pingfan},
  year = {2025},
  url = {https://github.com/pingfan-hu/tidyviz}
}
```
