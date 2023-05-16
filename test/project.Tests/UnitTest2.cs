using FluentAssertions;

namespace project.Tests;

public class UnitTest2
{
    [Fact]
    public void Test2()
    {
        var c = new Class2();
        var f = c.isValid();
        f.Should().BeAssignableTo(typeof(string));
        f.Should().StartWith("pos");
    }
}