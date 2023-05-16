using FluentAssertions;

namespace project.Tests;

public class UnitTest1
{
    [Fact]
    public void Test1()
    {
        var c = new Class1();
        var f = c.isValid();
        f.Should().BeAssignableTo(typeof(string));
    }
}