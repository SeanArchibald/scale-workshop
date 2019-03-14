describe('test', () => {
  it('should pass', () => {
    expect(1).toBeGreaterThan(0)
  })

  it('should not pass', () => {
    expect(1).toBeGreaterThan(10)
  })
})
