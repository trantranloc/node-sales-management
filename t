<!-- Giảm số lượng -->
                            <!-- <div class="d-flex">
                                <form action="orders/<%= orderId %>/decrease/<%= item.productId._id %>" method="post">
                                    <button type="submit" class="btn btn-outline-secondary btn-sm" name="action"
                                        value="decrease">-</button>
                                </form>
                                <input type="number" class="form-control mx-2" value="<%= item.quantity %>"
                                    style="width: 50px;" readonly>
                                <form action="orders/<%= orderId %>/increase/<%= item.productId._id %>" method="post">
                                    <button type="submit" class="btn btn-outline-secondary btn-sm" name="action"
                                        value="increase">+</button>
                                </form>
                            </div> -->

                            // Route: Cộng 1 sản phẩm vào giỏ hàng
                            router.post('/:orderId/increase/:productId', async (req, res) => {
                            try {
                            const { orderId, productId } = req.params; // Trích xuất orderId và productId từ URL
                            const order = await Order.findById(orderId);
                            
                            if (!order) {
                            return res.status(404).send('Đơn hàng không tồn tại.');
                            }
                            
                            // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
                            const existingItem = order.orderItems.find(item => item.productId.toString() === productId);
                            
                            if (existingItem) {
                            // Nếu sản phẩm đã có trong giỏ hàng, tăng số lượng
                            existingItem.quantity += 1;
                            
                            // Cập nhật lại tổng giá trị của đơn hàng
                            order.totalAmount = order.orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
                            } else {
                            // Nếu sản phẩm chưa có trong giỏ hàng, thêm sản phẩm mới với số lượng 1
                            const product = await Product.findById(productId);
                            if (!product) {
                            return res.status(404).send('Sản phẩm không tồn tại.');
                            }
                            
                            // Thêm sản phẩm mới vào giỏ hàng
                            order.orderItems.push({
                            productId: productId,
                            quantity: 1,
                            price: product.price
                            });
                            
                            // Cập nhật lại tổng giá trị của đơn hàng
                            order.totalAmount = order.orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
                            }
                            
                            // Lưu lại đơn hàng với các thay đổi
                            await order.save();
                            
                            // Chuyển hướng về trang đơn hàng
                            res.redirect('/orders');
                            } catch (err) {
                            console.error('Error increasing product quantity:', err);
                            res.status(500).send('Có lỗi xảy ra khi tăng số lượng sản phẩm.');
                            }
                            });
                            
                            // Route: Trừ 1 sản phẩm
                            router.post('/:id/decrease', async (req, res) => {
                            try {
                            const id = req.params.id;
                            const productId = req.body.productId;
                            const order = await Order.findById(id);
                            if (!order) {
                            return res.status(404).send('Đơn hàng không tồn tại.');
                            }
                            // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
                            const existingItem = order.orderItems.find(item => item.productId.toString() === productId);
                            // Nếu sản phẩm có trong giỏ hàng, giảm số lượng
                            if (existingItem) {
                            if (existingItem.quantity > 1) {
                            existingItem.quantity -= 1;
                            order.totalAmount = order.orderItems.reduce((total, item) => total + item.price *
                            item.quantity, 0);
                            } else {
                            // Xóa sản phẩm khỏi giỏ hàng
                            order.orderItems = order.orderItems.filter(item => item.productId.toString() !== productId);
                            order.totalAmount = order.orderItems.reduce((total, item) => total + item.price *
                            item.quantity, 0);
                            }
                            // Lưu đơn hàng
                            await order.save();
                            res.redirect('/orders');
                            } else {
                            res.status(404).send('Sản phẩm không tồn tại trong giỏ hàng.');
                            }
                            } catch (err) {
                            console.error('Error increasing product quantity:', err);
                            res.status(500).send('Có lỗi xảy ra khi tăng số lượng sản phẩm.');
                            
                            }
                            });