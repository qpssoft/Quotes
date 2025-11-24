using Quotes.Core.Entities;
using Xunit;

namespace Quotes.Core.Tests.Entities;

public class CategoryTests
{
    [Fact]
    public void Category_DefaultValues_AreSetCorrectly()
    {
        // Arrange & Act
        var category = new Category();

        // Assert
        Assert.Equal(string.Empty, category.Id);
        Assert.Equal(string.Empty, category.NameVi);
        Assert.Equal(string.Empty, category.NameEn);
        Assert.Null(category.Description);
        Assert.Null(category.Icon);
    }

    [Fact]
    public void Category_Id_CanBeSet()
    {
        // Arrange
        var id = "cat-wisdom";
        
        // Act
        var category = new Category { Id = id };

        // Assert
        Assert.Equal(id, category.Id);
    }

    [Fact]
    public void Category_NameVi_CanBeSet()
    {
        // Arrange
        var name = "Trí Tuệ";
        
        // Act
        var category = new Category { NameVi = name };

        // Assert
        Assert.Equal(name, category.NameVi);
    }

    [Fact]
    public void Category_NameEn_CanBeSet()
    {
        // Arrange
        var name = "Wisdom";
        
        // Act
        var category = new Category { NameEn = name };

        // Assert
        Assert.Equal(name, category.NameEn);
    }

    [Fact]
    public void Category_Description_CanBeSet()
    {
        // Arrange
        var description = "Quotes about wisdom and knowledge";
        
        // Act
        var category = new Category { Description = description };

        // Assert
        Assert.Equal(description, category.Description);
    }

    [Fact]
    public void Category_Icon_CanBeSet()
    {
        // Arrange
        var icon = "🧠";
        
        // Act
        var category = new Category { Icon = icon };

        // Assert
        Assert.Equal(icon, category.Icon);
    }

    [Fact]
    public void Category_FullCategoryCreation_SetsAllProperties()
    {
        // Arrange & Act
        var category = new Category
        {
            Id = "wisdom",
            NameVi = "Trí Tuệ",
            NameEn = "Wisdom",
            Description = "Quotes about wisdom and knowledge",
            Icon = "🧠"
        };

        // Assert
        Assert.Equal("wisdom", category.Id);
        Assert.Equal("Trí Tuệ", category.NameVi);
        Assert.Equal("Wisdom", category.NameEn);
        Assert.Equal("Quotes about wisdom and knowledge", category.Description);
        Assert.Equal("🧠", category.Icon);
    }

    [Fact]
    public void Category_BilingualNames_CanBeSet()
    {
        // Arrange & Act
        var category = new Category
        {
            NameVi = "Động Lực",
            NameEn = "Motivation"
        };

        // Assert
        Assert.Equal("Động Lực", category.NameVi);
        Assert.Equal("Motivation", category.NameEn);
    }

    [Theory]
    [InlineData("wisdom", "Trí Tuệ", "Wisdom")]
    [InlineData("motivation", "Động Lực", "Motivation")]
    [InlineData("love", "Tình Yêu", "Love")]
    [InlineData("success", "Thành Công", "Success")]
    public void Category_DifferentCategories_CanBeCreated(string id, string nameVi, string nameEn)
    {
        // Arrange & Act
        var category = new Category
        {
            Id = id,
            NameVi = nameVi,
            NameEn = nameEn
        };

        // Assert
        Assert.Equal(id, category.Id);
        Assert.Equal(nameVi, category.NameVi);
        Assert.Equal(nameEn, category.NameEn);
    }

    [Fact]
    public void Category_Description_CanBeNull()
    {
        // Arrange & Act
        var category = new Category
        {
            Id = "test",
            NameVi = "Test",
            NameEn = "Test"
        };

        // Assert
        Assert.Null(category.Description);
    }

    [Fact]
    public void Category_Icon_CanBeNull()
    {
        // Arrange & Act
        var category = new Category
        {
            Id = "test",
            NameVi = "Test",
            NameEn = "Test"
        };

        // Assert
        Assert.Null(category.Icon);
    }
}
