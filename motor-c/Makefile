CC = gcc
CFLAGS = -Wall -Wextra -O2 -fPIC -std=c11
SRC_DIR = src
BUILD_DIR = build
SRCS = $(wildcard $(SRC_DIR)/*.c)
OBJS = $(patsubst $(SRC_DIR)/%.c, $(BUILD_DIR)/%.o, $(SRCS))
LIB = $(BUILD_DIR)/libgridedge.so

all: $(BUILD_DIR) $(LIB)

$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

$(LIB): $(OBJS)
	$(CC) -shared -o $@ $^

$(BUILD_DIR)/%.o: $(SRC_DIR)/%.c
	$(CC) $(CFLAGS) -c $< -o $@

test: all
	$(CC) $(CFLAGS) -I$(SRC_DIR) tests/test_ybus.c $(OBJS) -o $(BUILD_DIR)/test_ybus -lm
	$(CC) $(CFLAGS) -I$(SRC_DIR) tests/test_newton.c $(OBJS) -o $(BUILD_DIR)/test_newton -lm
	./$(BUILD_DIR)/test_ybus
	./$(BUILD_DIR)/test_newton

clean:
	rm -rf $(BUILD_DIR)

.PHONY: all test clean
